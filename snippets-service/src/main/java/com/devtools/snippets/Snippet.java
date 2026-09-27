package com.devtools.snippets;

import java.time.Instant;
import java.util.UUID;

public record Snippet(UUID id, String title, String content, Language language, long version,
                      Instant createdAt, Instant updatedAt) {
    public enum Language { JSON, TEXT }
    public record Summary(UUID id, String title, Language language, long version, Instant updatedAt) {}
}
