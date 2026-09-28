package com.devtools.tools.features.fileconverter;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tools/files")
public class FileController {
  private final FileConversionService service;
  private final com.devtools.tools.execution.ExecutionService executions;

  public FileController(
      FileConversionService service, com.devtools.tools.execution.ExecutionService executions) {
    this.service = service;
    this.executions = executions;
  }

  @GetMapping("/capabilities")
  public FileConversionService.Capabilities capabilities() {
    return service.capabilities();
  }

  @PostMapping(value = "/inspect", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public FileConversionService.Inspection inspect(
      @RequestParam(defaultValue = "upload") String filename, HttpServletRequest request)
      throws IOException {
    return executions
        .awaitFile(
            new com.devtools.tools.execution.WorkerMain.Request(
                "inspect", null, null, filename, null, 0, 0, 90),
            FileSupport.read(request.getInputStream(), FileSupport.INPUT_LIMIT))
        .result()
        .inspection();
  }

  @PostMapping(value = "/convert", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public ResponseEntity<byte[]> convert(
      @RequestParam(defaultValue = "upload") String filename,
      @RequestParam String target,
      @RequestParam(defaultValue = "0") int sheet,
      @RequestParam(defaultValue = "0") int width,
      @RequestParam(defaultValue = "90") int quality,
      HttpServletRequest request)
      throws IOException {
    var completed =
        executions.awaitFile(
            new com.devtools.tools.execution.WorkerMain.Request(
                "convert", null, null, filename, target, sheet, width, quality),
            FileSupport.read(request.getInputStream(), FileSupport.INPUT_LIMIT));
    var result =
        new FileConversionService.Converted(
            completed.bytes(), completed.result().filename(), completed.result().mime());
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(result.mime()))
        .contentLength(result.bytes().length)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(result.filename()).build().toString())
        .header("X-Content-Type-Options", "nosniff")
        .header("Content-Security-Policy", "default-src 'none'; sandbox")
        .cacheControl(CacheControl.noStore())
        .body(result.bytes());
  }
}
