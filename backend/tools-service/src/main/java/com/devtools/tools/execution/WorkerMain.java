package com.devtools.tools.execution;

import com.devtools.tools.ApiException;
import com.devtools.tools.features.fileconverter.FileConversionService;
import com.devtools.tools.utilities.UtilityEngine;
import java.nio.file.*;

/** One request per process. Never boot Spring or open a listening socket here. */
public final class WorkerMain {
  static final com.fasterxml.jackson.databind.ObjectMapper TRANSPORT =
      new com.fasterxml.jackson.databind.ObjectMapper();

  public record Request(
      String operation,
      String toolId,
      UtilityEngine.Request utility,
      String filename,
      String target,
      int sheet,
      int width,
      int quality) {}

  public record Failure(String code, String message, int status) {}

  @io.swagger.v3.oas.annotations.media.Schema(name = "ExecutionResult")
  public record Result(
      UtilityEngine.Result utility,
      FileConversionService.Inspection inspection,
      String filename,
      String mime,
      Failure error) {}

  public static void main(String[] args) throws Exception {
    Path directory = Path.of(args[0]);
    var mapper = TRANSPORT;
    Result result;
    try {
      var request = mapper.readValue(directory.resolve("request.json").toFile(), Request.class);
      if (request.operation().equals("utility")) {
        result =
            new Result(
                UtilityEngine.execute(request.toolId(), request.utility()), null, null, null, null);
      } else {
        var service = new FileConversionService();
        byte[] input = Files.readAllBytes(directory.resolve("input"));
        if (request.operation().equals("inspect")) {
          result = new Result(null, service.inspect(input, request.filename()), null, null, null);
        } else if (request.operation().equals("convert")) {
          var converted =
              service.convert(
                  input,
                  request.filename(),
                  request.target(),
                  request.sheet(),
                  request.width(),
                  request.quality());
          Files.write(directory.resolve("output"), converted.bytes());
          result = new Result(null, null, converted.filename(), converted.mime(), null);
        } else throw new IllegalArgumentException("Unknown operation");
      }
    } catch (ApiException error) {
      result =
          new Result(
              null,
              null,
              null,
              null,
              new Failure(error.code, error.getMessage(), error.status.value()));
    } catch (Exception error) {
      result =
          new Result(
              null,
              null,
              null,
              null,
              new Failure(
                  "EXECUTION_FAILED",
                  "Processing failed. Check the input and format limits.",
                  422));
    }
    mapper.writeValue(directory.resolve("result.json").toFile(), result);
  }
}
