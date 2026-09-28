package com.devtools.tools.execution;

import com.devtools.tools.ApiException;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Ephemeral jobs; two active processes, sixteen queued, bounded retained results. */
@Service
public class ExecutionService {
  public enum State {
    QUEUED,
    RUNNING,
    SUCCEEDED,
    FAILED,
    CANCELLED,
    TIMED_OUT
  }

  @io.swagger.v3.oas.annotations.media.Schema(
      name = "ExecutionTicket",
      requiredProperties = {"id", "token"})
  public record Ticket(UUID id, String token) {}

  @io.swagger.v3.oas.annotations.media.Schema(
      name = "ExecutionView",
      requiredProperties = {"id", "state"})
  public record View(UUID id, State state, WorkerMain.Result result) {}

  private static final int MAX_JOBS = 64;
  private final Map<UUID, Job> jobs = new HashMap<>();
  private final ThreadPoolExecutor workers =
      new ThreadPoolExecutor(2, 2, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(16));
  private final ScheduledExecutorService reaper = Executors.newSingleThreadScheduledExecutor();
  private final Path root;
  private boolean closed;

  private static final class Job {
    final UUID id = UUID.randomUUID();
    final String token;
    final Path directory;
    final WorkerMain.Request request;
    volatile Instant finished;
    State state = State.QUEUED;
    WorkerMain.Result result;
    Process process;
    FutureTask<Void> task;

    Job(Path root, WorkerMain.Request request) throws IOException {
      byte[] bytes = new byte[32];
      new SecureRandom().nextBytes(bytes);
      token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
      directory = Files.createDirectory(root.resolve(id.toString()));
      this.request = request;
    }
  }

  public ExecutionService() throws IOException {
    root = Files.createTempDirectory("devdock-executions-");
    reaper.scheduleWithFixedDelay(this::expire, 15, 15, TimeUnit.SECONDS);
  }

  public synchronized Ticket submit(WorkerMain.Request request, byte[] input) throws IOException {
    if (closed || jobs.size() >= MAX_JOBS) throw busy();
    Job job = new Job(root, request);
    try {
      WorkerMain.TRANSPORT.writeValue(job.directory.resolve("request.json").toFile(), request);
      if (input != null) Files.write(job.directory.resolve("input"), input);
      job.task =
          new FutureTask<>(
              () -> {
                execute(job);
                return null;
              });
      jobs.put(job.id, job);
      workers.execute(job.task);
      return new Ticket(job.id, job.token);
    } catch (RejectedExecutionException error) {
      jobs.remove(job.id);
      removeFiles(job.directory);
      throw busy();
    } catch (IOException error) {
      jobs.remove(job.id);
      removeFiles(job.directory);
      throw error;
    }
  }

  private static ApiException busy() {
    return new ApiException(
        HttpStatus.TOO_MANY_REQUESTS,
        "EXECUTION_BUSY",
        "All execution slots are busy. Try again shortly.");
  }

  private synchronized Job owned(UUID id, String token) {
    Job job = jobs.get(id);
    if (job == null
        || token == null
        || !MessageDigest.isEqual(
            job.token.getBytes(java.nio.charset.StandardCharsets.US_ASCII),
            token.getBytes(java.nio.charset.StandardCharsets.US_ASCII)))
      throw new ApiException(
          HttpStatus.NOT_FOUND, "EXECUTION_NOT_FOUND", "Execution not found or expired.");
    return job;
  }

  public View get(UUID id, String token) {
    Job job = owned(id, token);
    synchronized (job) {
      return new View(job.id, job.state, job.result);
    }
  }

  public byte[] download(UUID id, String token) throws IOException {
    Job job = owned(id, token);
    synchronized (job) {
      if (job.state != State.SUCCEEDED || job.result.filename() == null)
        throw new ApiException(
            HttpStatus.CONFLICT,
            "RESULT_NOT_READY",
            "No download is available for this execution.");
      return Files.readAllBytes(job.directory.resolve("output"));
    }
  }

  public void delete(UUID id, String token) {
    Job job = owned(id, token);
    synchronized (job) {
      job.state = State.CANCELLED;
      job.result = null;
      job.finished = Instant.now();
      terminate(job.process);
      job.task.cancel(true);
      workers.remove(job.task);
      removeFiles(job.directory);
    }
    synchronized (this) {
      jobs.remove(id);
    }
  }

  private void execute(Job job) {
    try {
      synchronized (job) {
        if (job.state != State.QUEUED) return;
        job.process =
            new ProcessBuilder(command(job.directory))
                .directory(job.directory.toFile())
                .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                .redirectError(ProcessBuilder.Redirect.DISCARD)
                .start();
        job.state = State.RUNNING;
      }
      int seconds = job.request.operation().equals("utility") ? 10 : 60;
      boolean completed = job.process.waitFor(seconds, TimeUnit.SECONDS);
      synchronized (job) {
        if (job.state != State.RUNNING) return;
        if (!completed) {
          terminate(job.process);
          job.state = State.TIMED_OUT;
          job.result =
              failure(
                  "EXECUTION_TIMEOUT",
                  "Execution exceeded its time limit. Use smaller input or a simpler expression.",
                  422);
        } else if (job.process.exitValue() != 0
            || !Files.exists(job.directory.resolve("result.json"))) {
          job.state = State.FAILED;
          job.result =
              failure(
                  "WORKER_FAILED",
                  "The worker stopped. Input may exceed memory or format limits.",
                  422);
        } else {
          if (Files.size(job.directory.resolve("result.json")) > 8_000_000)
            throw new IOException("Oversized result");
          job.result =
              WorkerMain.TRANSPORT.readValue(
                  job.directory.resolve("result.json").toFile(), WorkerMain.Result.class);
          job.state = job.result.error() == null ? State.SUCCEEDED : State.FAILED;
        }
      }
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
    } catch (Exception error) {
      synchronized (job) {
        if (job.state == State.RUNNING || job.state == State.QUEUED) {
          job.state = State.FAILED;
          job.result =
              failure("WORKER_FAILED", "The execution worker could not complete the request.", 503);
        }
      }
    } finally {
      synchronized (job) {
        terminate(job.process);
        try {
          Files.deleteIfExists(job.directory.resolve("input"));
          Files.deleteIfExists(job.directory.resolve("request.json"));
          Files.deleteIfExists(job.directory.resolve("result.json"));
        } catch (IOException ignored) {
        }
        job.finished = Instant.now();
      }
    }
  }

  private static WorkerMain.Result failure(String code, String message, int status) {
    return new WorkerMain.Result(
        null, null, null, null, new WorkerMain.Failure(code, message, status));
  }

  public record Completed(WorkerMain.Result result, byte[] bytes) {}

  /** Compatibility endpoints use the same isolation and cancel before the gateway deadline. */
  public Completed awaitFile(WorkerMain.Request request, byte[] input) throws IOException {
    Ticket ticket = submit(request, input);
    try {
      long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(8);
      while (System.nanoTime() < deadline) {
        View view = get(ticket.id(), ticket.token());
        if (view.state() == State.SUCCEEDED)
          return new Completed(
              view.result(),
              view.result().filename() == null ? null : download(ticket.id(), ticket.token()));
        if (view.state() != State.RUNNING && view.state() != State.QUEUED) {
          var error = view.result().error();
          throw new ApiException(HttpStatus.valueOf(error.status()), error.code(), error.message());
        }
        Thread.sleep(25);
      }
      throw new ApiException(
          HttpStatus.GATEWAY_TIMEOUT,
          "EXECUTION_TIMEOUT",
          "Use the asynchronous execution API for this conversion.");
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      throw new ApiException(
          HttpStatus.SERVICE_UNAVAILABLE, "EXECUTION_CANCELLED", "Execution was interrupted.");
    } finally {
      delete(ticket.id(), ticket.token());
    }
  }

  private static List<String> command(Path directory) {
    List<String> command =
        new ArrayList<>(
            List.of(
                Path.of(System.getProperty("java.home"), "bin", "java").toString(),
                "-Xmx256m",
                "-Xss512k",
                "-XX:MaxMetaspaceSize=128m",
                "-XX:MaxDirectMemorySize=32m",
                "-XX:ActiveProcessorCount=2",
                "-Djava.awt.headless=true"));
    String jar = System.getProperty("devdock.worker.jar");
    String launch = System.getProperty("sun.java.command", "").split(" ")[0];
    if (jar == null
        && launch.endsWith(".jar")
        && System.getProperty("surefire.test.class.path") == null)
      jar = Path.of(launch).toAbsolutePath().toString();
    if (jar != null) command.addAll(List.of("-jar", jar, "--worker"));
    else {
      String classpath =
          Arrays.stream(
                  System.getProperty(
                          "surefire.test.class.path", System.getProperty("java.class.path"))
                      .split(java.io.File.pathSeparator))
              .map(path -> Path.of(path).toAbsolutePath().toString())
              .collect(java.util.stream.Collectors.joining(java.io.File.pathSeparator));
      command.addAll(List.of("-cp", classpath, WorkerMain.class.getName()));
    }
    command.add(directory.toString());
    return command;
  }

  private static void terminate(Process process) {
    if (process == null) return;
    var descendants = process.descendants().toList();
    descendants.reversed().forEach(ProcessHandle::destroyForcibly);
    if (process.isAlive()) process.destroyForcibly();
    try {
      process.waitFor(2, TimeUnit.SECONDS);
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
    }
  }

  private static void removeFiles(Path directory) {
    if (!Files.exists(directory)) return;
    try (var paths = Files.walk(directory)) {
      paths
          .sorted(Comparator.reverseOrder())
          .forEach(
              path -> {
                try {
                  Files.deleteIfExists(path);
                } catch (IOException ignored) {
                }
              });
    } catch (IOException ignored) {
    }
  }

  private void expire() {
    List<Job> expired;
    synchronized (this) {
      expired =
          jobs.values().stream()
              .filter(
                  job ->
                      job.finished != null
                          && job.finished.isBefore(Instant.now().minusSeconds(120)))
              .toList();
    }
    for (Job job : expired) {
      try {
        delete(job.id, job.token);
      } catch (ApiException ignored) {
      }
    }
  }

  @PreDestroy
  public void close() {
    List<Job> all;
    synchronized (this) {
      closed = true;
      all = List.copyOf(jobs.values());
    }
    reaper.shutdownNow();
    for (Job job : all) {
      try {
        delete(job.id, job.token);
      } catch (ApiException ignored) {
      }
    }
    workers.shutdownNow();
    removeFiles(root);
  }
}
