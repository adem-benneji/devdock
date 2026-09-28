package com.devtools.snippets;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class SnippetRepository {
  private final JdbcClient jdbc;
  private static final RowMapper<Snippet> MAPPER =
      (rs, row) ->
          new Snippet(
              rs.getObject("id", UUID.class),
              rs.getString("title"),
              rs.getString("content"),
              Snippet.Language.valueOf(rs.getString("language")),
              rs.getLong("version"),
              rs.getTimestamp("created_at").toInstant(),
              rs.getTimestamp("updated_at").toInstant());

  public SnippetRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  public Optional<Snippet> find(UUID id) {
    return jdbc.sql("SELECT * FROM snippets WHERE id = ?").param(id).query(MAPPER).optional();
  }

  public List<Snippet.Summary> list(int limit, int offset) {
    return jdbc.sql(
            "SELECT id, title, language, version, updated_at FROM snippets ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?")
        .params(limit, offset)
        .query(
            (rs, row) ->
                new Snippet.Summary(
                    rs.getObject("id", UUID.class),
                    rs.getString("title"),
                    Snippet.Language.valueOf(rs.getString("language")),
                    rs.getLong("version"),
                    rs.getTimestamp("updated_at").toInstant()))
        .list();
  }

  public Snippet create(String title, String content, Snippet.Language language) {
    return jdbc.sql(
            "INSERT INTO snippets (id, title, content, language) VALUES (?, ?, ?, ?) RETURNING *")
        .params(UUID.randomUUID(), title, content, language.name())
        .query(MAPPER)
        .single();
  }

  public Optional<Snippet> update(
      UUID id, String title, String content, Snippet.Language language, long version) {
    return jdbc.sql(
            "UPDATE snippets SET title = ?, content = ?, language = ?, version = version + 1, updated_at = clock_timestamp() WHERE id = ? AND version = ? RETURNING *")
        .params(title, content, language.name(), id, version)
        .query(MAPPER)
        .optional();
  }

  public boolean delete(UUID id, long version) {
    return jdbc.sql("DELETE FROM snippets WHERE id = ? AND version = ?")
            .params(id, version)
            .update()
        == 1;
  }
}
