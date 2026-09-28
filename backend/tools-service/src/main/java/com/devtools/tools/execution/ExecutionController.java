package com.devtools.tools.execution;

import com.devtools.tools.ApiException;
import com.devtools.tools.utilities.UtilityEngine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tools")
public class ExecutionController {
  private final ExecutionService executions;

  public ExecutionController(ExecutionService executions) {
    this.executions = executions;
  }

  @GetMapping("/utilities")
  public com.fasterxml.jackson.databind.JsonNode definitions() {
    return UtilityEngine.definitions();
  }

  @PostMapping("/{toolId}/executions")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public ExecutionService.Ticket utility(
      @PathVariable String toolId, @Valid @RequestBody UtilityEngine.Request request)
      throws IOException {
    UtilityEngine.validate(toolId, request);
    return executions.submit(
        new WorkerMain.Request("utility", toolId, request, null, null, 0, 0, 0), null);
  }

  @io.swagger.v3.oas.annotations.parameters.RequestBody(
      required = true,
      content =
          @io.swagger.v3.oas.annotations.media.Content(
              mediaType = "application/octet-stream",
              schema =
                  @io.swagger.v3.oas.annotations.media.Schema(type = "string", format = "binary")))
  @PostMapping(value = "/files/executions", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  @ResponseStatus(HttpStatus.ACCEPTED)
  public ExecutionService.Ticket file(
      @RequestParam String operation,
      @RequestParam(defaultValue = "upload") String filename,
      @RequestParam(defaultValue = "") String target,
      @RequestParam(defaultValue = "0") int sheet,
      @RequestParam(defaultValue = "0") int width,
      @RequestParam(defaultValue = "90") int quality,
      HttpServletRequest request)
      throws IOException {
    if (!java.util.Set.of("inspect", "convert").contains(operation)
        || filename.length() > 255
        || target.length() > 32
        || sheet < 0
        || width < 0
        || width > 12000
        || quality < 1
        || quality > 100)
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_REQUEST",
          "Invalid file operation or conversion options.");
    byte[] input = request.getInputStream().readNBytes(5_000_001);
    if (input.length == 0 || input.length > 5_000_000)
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_FILE", "Choose a nonempty file up to 5 MB.");
    return executions.submit(
        new WorkerMain.Request(operation, null, null, filename, target, sheet, width, quality),
        input);
  }

  @GetMapping("/executions/{id}")
  public ExecutionService.View get(
      @PathVariable UUID id, @RequestHeader("X-Execution-Token") String token) {
    return executions.get(id, token);
  }

  @DeleteMapping("/executions/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID id, @RequestHeader("X-Execution-Token") String token) {
    executions.delete(id, token);
  }

  @GetMapping("/executions/{id}/download")
  public ResponseEntity<byte[]> download(
      @PathVariable UUID id, @RequestHeader("X-Execution-Token") String token) throws IOException {
    byte[] bytes = executions.download(id, token);
    var result = executions.get(id, token).result();
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(result.mime()))
        .contentLength(bytes.length)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(result.filename()).build().toString())
        .header("X-Content-Type-Options", "nosniff")
        .header("Content-Security-Policy", "default-src 'none'; sandbox")
        .cacheControl(CacheControl.noStore())
        .body(bytes);
  }
}
