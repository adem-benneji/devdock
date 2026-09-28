package com.devtools.snippets;

import java.util.Map;
import java.util.TreeMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiErrors {
  private static final Logger LOG = LoggerFactory.getLogger(ApiErrors.class);

  @io.swagger.v3.oas.annotations.media.Schema(
      name = "ApiError",
      requiredProperties = {"code", "message", "fields"})
  public record Error(String code, String message, Map<String, String> fields) {}

  private ResponseEntity<Error> error(HttpStatus status, String code, String message) {
    return ResponseEntity.status(status).body(new Error(code, message, Map.of()));
  }

  @ExceptionHandler(ApiException.class)
  ResponseEntity<Error> domain(ApiException ex) {
    return error(ex.status, ex.code, ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Error> validation(MethodArgumentNotValidException ex) {
    Map<String, String> fields = new TreeMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(e -> fields.putIfAbsent(e.getField(), e.getDefaultMessage()));
    return ResponseEntity.badRequest()
        .body(new Error("VALIDATION_ERROR", "Check the highlighted fields.", fields));
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    MethodArgumentTypeMismatchException.class
  })
  ResponseEntity<Error> malformed(Exception ex) {
    return error(
        HttpStatus.BAD_REQUEST,
        "INVALID_REQUEST",
        "Request body or parameter has an invalid type or value.");
  }

  @ExceptionHandler(NoResourceFoundException.class)
  ResponseEntity<Error> missing(Exception ex) {
    return error(HttpStatus.NOT_FOUND, "NOT_FOUND", "Endpoint not found.");
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  ResponseEntity<Error> method(Exception ex) {
    return error(
        HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "HTTP method is not supported.");
  }

  @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
  ResponseEntity<Error> media(Exception ex) {
    return error(
        HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", "Use application/json.");
  }

  @ExceptionHandler(org.springframework.dao.DuplicateKeyException.class)
  ResponseEntity<Error> duplicate(Exception ex) {
    return error(
        HttpStatus.CONFLICT,
        "TITLE_CONFLICT",
        "A snippet with this title already exists. Choose another title.");
  }

  @ExceptionHandler({
    org.springframework.dao.DataAccessResourceFailureException.class,
    org.springframework.transaction.CannotCreateTransactionException.class,
    org.springframework.dao.QueryTimeoutException.class
  })
  ResponseEntity<Error> unavailable(Exception ex) {
    return error(
        HttpStatus.SERVICE_UNAVAILABLE,
        "DATABASE_UNAVAILABLE",
        "Snippet storage is unavailable. Try again shortly.");
  }

  @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
  ResponseEntity<Error> missingParameter(Exception ex) {
    return error(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "A required parameter is missing.");
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Error> unexpected(Exception ex) {
    LOG.error("Unhandled service failure: {}", ex.getClass().getName());
    return error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "INTERNAL_ERROR",
        "The service could not complete the request.");
  }
}
