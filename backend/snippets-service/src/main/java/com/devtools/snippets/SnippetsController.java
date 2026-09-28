package com.devtools.snippets;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/snippets")
public class SnippetsController {
  public record CreateRequest(
      @NotBlank
          @Size(max = 120)
          @Pattern(
              regexp = "[^\\x00-\\x1F\\x7F]*",
              message = "Title cannot contain control characters.")
          String title,
      @NotBlank
          @Size(max = 1_000_000)
          @Pattern(regexp = "[^\\x00]*", message = "Content cannot contain a NUL character.")
          String content,
      @NotNull Snippet.Language language) {}

  public record UpdateRequest(
      @NotBlank
          @Size(max = 120)
          @Pattern(
              regexp = "[^\\x00-\\x1F\\x7F]*",
              message = "Title cannot contain control characters.")
          String title,
      @NotBlank
          @Size(max = 1_000_000)
          @Pattern(regexp = "[^\\x00]*", message = "Content cannot contain a NUL character.")
          String content,
      @NotNull Snippet.Language language,
      @NotNull @PositiveOrZero Long version) {}

  private final SnippetService service;

  public SnippetsController(SnippetService service) {
    this.service = service;
  }

  @GetMapping
  SnippetService.Page list(
      @RequestParam(defaultValue = "20") int limit, @RequestParam(defaultValue = "0") int offset) {
    return service.list(limit, offset);
  }

  @GetMapping("/{id}")
  Snippet get(@PathVariable UUID id) {
    return service.get(id);
  }

  @PostMapping
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  ResponseEntity<Snippet> create(@Valid @RequestBody CreateRequest request) {
    Snippet snippet = service.create(request.title(), request.content(), request.language());
    return ResponseEntity.created(URI.create("/api/snippets/" + snippet.id())).body(snippet);
  }

  @PutMapping("/{id}")
  Snippet update(@PathVariable UUID id, @Valid @RequestBody UpdateRequest request) {
    return service.update(
        id, request.title(), request.content(), request.language(), request.version());
  }

  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  @DeleteMapping("/{id}")
  ResponseEntity<Void> delete(@PathVariable UUID id, @RequestParam long version) {
    service.delete(id, version);
    return ResponseEntity.noContent().build();
  }
}
