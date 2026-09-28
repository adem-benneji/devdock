package com.devtools.snippets;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SnippetService {
  @io.swagger.v3.oas.annotations.media.Schema(
      requiredProperties = {"items", "limit", "offset", "hasNext"})
  public record Page(List<Snippet.Summary> items, int limit, int offset, boolean hasNext) {}

  private final SnippetRepository repository;

  public SnippetService(SnippetRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public Page list(int limit, int offset) {
    if (limit < 1 || limit > 100 || offset < 0 || offset > 1_000_000)
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_PAGINATION",
          "Limit must be 1–100 and offset 0–1000000.");
    var rows = repository.list(limit + 1, offset);
    return new Page(rows.stream().limit(limit).toList(), limit, offset, rows.size() > limit);
  }

  @Transactional(readOnly = true)
  public Snippet get(UUID id) {
    return repository.find(id).orElseThrow(this::missing);
  }

  public Snippet create(String title, String content, Snippet.Language language) {
    return repository.create(normalize(title), content, language);
  }

  public Snippet update(
      UUID id, String title, String content, Snippet.Language language, long version) {
    return repository
        .update(id, normalize(title), content, language, version)
        .orElseThrow(() -> conflictOrMissing(id));
  }

  public void delete(UUID id, long version) {
    if (version < 0)
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_VERSION", "Version must be non-negative.");
    if (!repository.delete(id, version)) throw conflictOrMissing(id);
  }

  private String normalize(String title) {
    String normalized = title.strip();
    if (normalized.isEmpty())
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TITLE", "Title must not be blank.");
    return normalized;
  }

  private ApiException conflictOrMissing(UUID id) {
    if (repository.find(id).isEmpty()) return missing();
    return new ApiException(
        HttpStatus.CONFLICT,
        "VERSION_CONFLICT",
        "This snippet changed. Reopen it before updating or deleting.");
  }

  private ApiException missing() {
    return new ApiException(
        HttpStatus.NOT_FOUND, "SNIPPET_NOT_FOUND", "The snippet could not be found.");
  }
}
