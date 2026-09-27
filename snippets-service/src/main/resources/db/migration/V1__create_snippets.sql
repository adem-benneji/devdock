CREATE TABLE snippets (
    id UUID PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(16) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0 CHECK (version >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT snippets_title_valid CHECK (char_length(btrim(title)) BETWEEN 1 AND 120 AND title = btrim(title)),
    CONSTRAINT snippets_content_valid CHECK (char_length(content) BETWEEN 1 AND 1000000),
    CONSTRAINT snippets_language_valid CHECK (language IN ('JSON', 'TEXT'))
);
CREATE UNIQUE INDEX snippets_title_unique ON snippets (lower(title));
CREATE INDEX snippets_recent ON snippets (updated_at DESC, id DESC);
