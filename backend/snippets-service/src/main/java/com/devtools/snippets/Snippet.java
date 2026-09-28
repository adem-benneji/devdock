package com.devtools.snippets;

import java.time.Instant;
import java.util.UUID;

@io.swagger.v3.oas.annotations.media.Schema(
    requiredProperties = {
      "id",
      "title",
      "content",
      "language",
      "version",
      "createdAt",
      "updatedAt"
    })
public record Snippet(
    UUID id,
    String title,
    String content,
    Language language,
    long version,
    Instant createdAt,
    Instant updatedAt) {
  public enum Language {
    JSON,
    TEXT
  }

  @io.swagger.v3.oas.annotations.media.Schema(
      requiredProperties = {"id", "title", "language", "version", "updatedAt"})
  public record Summary(
      UUID id, String title, Language language, long version, Instant updatedAt) {}
}
