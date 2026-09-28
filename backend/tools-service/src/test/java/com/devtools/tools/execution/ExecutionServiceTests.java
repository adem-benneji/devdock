package com.devtools.tools.execution;

import static org.junit.jupiter.api.Assertions.*;

import com.devtools.tools.ApiException;
import com.devtools.tools.utilities.UtilityEngine;
import java.util.*;
import org.junit.jupiter.api.Test;

class ExecutionServiceTests {
  private WorkerMain.Request utility(
      String id, String input, String mode, Map<String, String> fields) {
    return new WorkerMain.Request(
        "utility", id, new UtilityEngine.Request(input, mode, fields), null, null, 0, 0, 0);
  }

  private ExecutionService.View finished(ExecutionService service, ExecutionService.Ticket ticket)
      throws Exception {
    long end = System.nanoTime() + java.util.concurrent.TimeUnit.SECONDS.toNanos(20);
    while (System.nanoTime() < end) {
      var view = service.get(ticket.id(), ticket.token());
      if (!Set.of(ExecutionService.State.QUEUED, ExecutionService.State.RUNNING)
          .contains(view.state())) return view;
      Thread.sleep(30);
    }
    throw new AssertionError("Job did not finish");
  }

  @Test
  void executesInAChildProcessAndRequiresThePrivateToken() throws Exception {
    var service = new ExecutionService();
    try {
      var ticket = service.submit(utility("base64", "Hello 👋", "encode", Map.of()), null);
      assertThrows(ApiException.class, () -> service.get(ticket.id(), "wrong"));
      var result = finished(service, ticket);
      assertEquals(
          ExecutionService.State.SUCCEEDED, result.state(), String.valueOf(result.result()));
      assertEquals("SGVsbG8g8J+Riw==", result.result().utility().output());
      service.delete(ticket.id(), ticket.token());
      assertThrows(ApiException.class, () -> service.get(ticket.id(), ticket.token()));
    } finally {
      service.close();
    }
  }

  @Test
  void preservesLargeResultsAcrossWorkerTransportAndSanitizesFailures() throws Exception {
    var service = new ExecutionService();
    try {
      var large = service.submit(utility("base64", "x".repeat(100000), "encode", Map.of()), null);
      var result = finished(service, large);
      assertEquals(ExecutionService.State.SUCCEEDED, result.state());
      assertEquals(133336, result.result().utility().output().length());
      var invalid =
          service.submit(utility("json-string", "secret-payload", "unescape", Map.of()), null);
      var failure = finished(service, invalid);
      assertEquals(ExecutionService.State.FAILED, failure.state());
      assertFalse(failure.result().error().message().contains("secret-payload"));
    } finally {
      service.close();
    }
  }

  @Test
  void convertsRealFilesInTheWorker() throws Exception {
    var service = new ExecutionService();
    try {
      var ticket =
          service.submit(
              new WorkerMain.Request("convert", null, null, "sample.csv", "json", 0, 0, 90),
              "name,id\nAda,001\n".getBytes(java.nio.charset.StandardCharsets.UTF_8));
      assertEquals(ExecutionService.State.SUCCEEDED, finished(service, ticket).state());
      var json =
          com.devtools.tools.utilities.UtilitySupport.JSON.readTree(
              service.download(ticket.id(), ticket.token()));
      assertEquals("001", json.get(0).path("id").asText());
    } finally {
      service.close();
    }
  }

  @Test
  void cancelsRunningAndQueuedWorkAndRecoversTheQueue() throws Exception {
    var service = new ExecutionService();
    var slow =
        utility(
            "regex-tester",
            "a".repeat(99000) + "!",
            "match",
            Map.of("pattern", "(a+)+$", "flags", "g"));
    try {
      var first = service.submit(slow, null);
      var second = service.submit(slow, null);
      var queued = service.submit(slow, null);
      long end = System.nanoTime() + java.util.concurrent.TimeUnit.SECONDS.toNanos(5);
      while (service.get(first.id(), first.token()).state() == ExecutionService.State.QUEUED
          && System.nanoTime() < end) Thread.sleep(10);
      assertEquals(ExecutionService.State.RUNNING, service.get(first.id(), first.token()).state());
      assertEquals(ExecutionService.State.QUEUED, service.get(queued.id(), queued.token()).state());
      var children = ProcessHandle.current().children().toList();
      service.delete(queued.id(), queued.token());
      service.delete(first.id(), first.token());
      service.delete(second.id(), second.token());
      assertTrue(
          children.stream().noneMatch(ProcessHandle::isAlive), "Cancelled JVMs must actually stop");
      var quick = service.submit(utility("base64", "ok", "encode", Map.of()), null);
      assertEquals(ExecutionService.State.SUCCEEDED, finished(service, quick).state());
    } finally {
      service.close();
    }
  }

  @Test
  void boundsTheQueueAndTimesOutPathologicalRegex() throws Exception {
    var service = new ExecutionService();
    try {
      var slow =
          utility(
              "regex-tester",
              "a".repeat(99000) + "!",
              "match",
              Map.of("pattern", "(a+)+$", "flags", "g"));
      var first = service.submit(slow, null);
      for (int i = 0; i < 17; i++) service.submit(slow, null);
      var busy = assertThrows(ApiException.class, () -> service.submit(slow, null));
      assertEquals("EXECUTION_BUSY", busy.code);
      assertEquals(ExecutionService.State.TIMED_OUT, finished(service, first).state());
    } finally {
      service.close();
    }
  }
}
