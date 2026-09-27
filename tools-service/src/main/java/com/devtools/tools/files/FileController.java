package com.devtools.tools.files;

import java.io.IOException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tools/files")
public class FileController {
    private final FileConversionService service;
    public FileController(FileConversionService service) { this.service = service; }
    @GetMapping("/capabilities") public FileConversionService.Capabilities capabilities() { return service.capabilities(); }
    @PostMapping(value = "/inspect", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public FileConversionService.Inspection inspect(@RequestParam(defaultValue = "upload") String filename, HttpServletRequest request) throws IOException {
        return service.inspect(FileSupport.read(request.getInputStream(), FileSupport.INPUT_LIMIT), filename);
    }
    @PostMapping(value = "/convert", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> convert(@RequestParam(defaultValue = "upload") String filename, @RequestParam String target,
        @RequestParam(defaultValue = "0") int sheet, @RequestParam(defaultValue = "0") int width, @RequestParam(defaultValue = "90") int quality, HttpServletRequest request) throws IOException {
        var result = service.convert(FileSupport.read(request.getInputStream(), FileSupport.INPUT_LIMIT), filename, target, sheet, width, quality);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(result.mime())).contentLength(result.bytes().length)
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(result.filename()).build().toString())
            .header("X-Content-Type-Options", "nosniff").header("Content-Security-Policy", "default-src 'none'; sandbox")
            .cacheControl(CacheControl.noStore()).body(result.bytes());
    }
}
