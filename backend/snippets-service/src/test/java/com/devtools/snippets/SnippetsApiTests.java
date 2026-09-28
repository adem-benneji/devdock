package com.devtools.snippets;

import static org.assertj.core.api.Assertions.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SnippetsApiTests {
  private static final String SCHEMA = "test_" + UUID.randomUUID().toString().replace("-", "");

  @DynamicPropertySource
  static void database(DynamicPropertyRegistry r) {
    r.add(
        "spring.datasource.url",
        () ->
            System.getenv()
                .getOrDefault("TEST_DB_URL", "jdbc:postgresql://127.0.0.1:55432/devdock_snippets"));
    r.add(
        "spring.datasource.username",
        () -> System.getenv().getOrDefault("TEST_DB_USER", "devdock"));
    r.add("spring.datasource.password", () -> System.getenv().getOrDefault("TEST_DB_PASSWORD", ""));
    r.add("spring.flyway.schemas", () -> SCHEMA);
    r.add("spring.datasource.hikari.schema", () -> SCHEMA);
  }

  @Autowired TestRestTemplate http;
  @Autowired JdbcTemplate jdbc;

  @BeforeEach
  void clean() {
    jdbc.update("DELETE FROM snippets");
  }

  @AfterAll
  void dropSchema() {
    jdbc.execute("DROP SCHEMA " + SCHEMA + " CASCADE");
  }

  private Map<String, Object> draft(String title) {
    return Map.of("title", title, "content", "{\"value\":1}", "language", "JSON");
  }

  private Snippet create(String title) {
    return http.postForObject("/api/snippets", draft(title), Snippet.class);
  }

  private ResponseEntity<String> update(Snippet snippet, String title) {
    return http.exchange(
        "/api/snippets/" + snippet.id(),
        HttpMethod.PUT,
        new HttpEntity<>(
            Map.of(
                "title",
                title,
                "content",
                "[2]",
                "language",
                "JSON",
                "version",
                snippet.version())),
        String.class);
  }

  private ResponseEntity<String> delete(Snippet snippet) {
    return http.exchange(
        "/api/snippets/" + snippet.id() + "?version=" + snippet.version(),
        HttpMethod.DELETE,
        HttpEntity.EMPTY,
        String.class);
  }

  @Test
  void fullCrudPersistsDataAndVersions() {
    var response = http.postForEntity("/api/snippets", draft("  Example  "), Snippet.class);
    assertThat(response.getStatusCode().value()).isEqualTo(201);
    Snippet snippet = response.getBody();
    assertThat(response.getHeaders().getLocation().toString())
        .isEqualTo("/api/snippets/" + snippet.id());
    assertThat(snippet.title()).isEqualTo("Example");
    assertThat(snippet.version()).isZero();
    assertThat(
            jdbc.queryForObject(
                "SELECT content FROM snippets WHERE id = ?", String.class, snippet.id()))
        .isEqualTo(snippet.content());
    assertThat(http.getForObject("/api/snippets/" + snippet.id(), Snippet.class))
        .isEqualTo(snippet);
    assertThat(update(snippet, "Renamed").getStatusCode().value()).isEqualTo(200);
    Snippet changed = http.getForObject("/api/snippets/" + snippet.id(), Snippet.class);
    assertThat(changed.version()).isEqualTo(1);
    assertThat(changed.createdAt()).isEqualTo(snippet.createdAt());
    assertThat(changed.content()).isEqualTo("[2]");
    assertThat(delete(changed).getStatusCode().value()).isEqualTo(204);
    assertThat(
            http.getForEntity("/api/snippets/" + snippet.id(), String.class)
                .getStatusCode()
                .value())
        .isEqualTo(404);
  }

  @Test
  void staleWritesAndDeletesCannotLoseData() {
    Snippet original = create("Concurrent");
    assertThat(update(original, "Changed").getStatusCode().value()).isEqualTo(200);
    assertThat(update(original, "Stale").getBody()).contains("VERSION_CONFLICT");
    assertThat(delete(original).getStatusCode().value()).isEqualTo(409);
    assertThat(http.getForObject("/api/snippets/" + original.id(), Snippet.class).title())
        .isEqualTo("Changed");
  }

  @Test
  void concurrentUpdatesHaveExactlyOneWinner() throws Exception {
    Snippet original = create("Race");
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
      var first = executor.submit(() -> update(original, "First").getStatusCode().value());
      var second = executor.submit(() -> update(original, "Second").getStatusCode().value());
      assertThat(java.util.List.of(first.get(), second.get())).containsExactlyInAnyOrder(200, 409);
    }
  }

  @Test
  void titlesAreUniqueAfterNormalizationAndConflictsRollback() {
    create("Example");
    var duplicate = http.postForEntity("/api/snippets", draft(" example "), String.class);
    assertThat(duplicate.getStatusCode().value()).isEqualTo(409);
    assertThat(duplicate.getBody()).contains("TITLE_CONFLICT");
    var other = create("Other");
    assertThat(update(other, "EXAMPLE").getStatusCode().value()).isEqualTo(409);
    assertThat(http.getForObject("/api/snippets/" + other.id(), Snippet.class).version()).isZero();
  }

  @Test
  void listsBoundedSummariesInStableRecentOrder() {
    create("One");
    create("Two");
    create("Three");
    var first = http.getForObject("/api/snippets?limit=2", SnippetService.Page.class);
    assertThat(first.items()).hasSize(2);
    assertThat(first.hasNext()).isTrue();
    assertThat(first.items().getFirst().title()).isEqualTo("Three");
    var second = http.getForObject("/api/snippets?limit=2&offset=2", SnippetService.Page.class);
    assertThat(second.items()).hasSize(1);
    assertThat(second.hasNext()).isFalse();
    assertThat(http.getForObject("/api/snippets", String.class)).doesNotContain("content");
  }

  @Test
  void validatesFieldsParametersAndMissingResources() {
    for (String title : new String[] {"", " ", "x".repeat(121), "line\nbreak"}) {
      var response = http.postForEntity("/api/snippets", draft(title), String.class);
      assertThat(response.getStatusCode().value()).isEqualTo(400);
      assertThat(response.getBody()).contains("title");
    }
    for (String content : new String[] {"", " ", "x".repeat(1_000_001), "null\0character"}) {
      assertThat(
              http.postForEntity(
                      "/api/snippets",
                      Map.of("title", "Invalid", "content", content, "language", "JSON"),
                      String.class)
                  .getStatusCode()
                  .value())
          .isEqualTo(400);
    }
    for (String path :
        new String[] {"?limit=0", "?limit=101", "?offset=-1", "?limit=wrong", "/not-a-uuid"})
      assertThat(http.getForEntity("/api/snippets" + path, String.class).getStatusCode().value())
          .isEqualTo(400);
    var missing =
        new Snippet(UUID.randomUUID(), "Missing", "{}", Snippet.Language.JSON, 0, null, null);
    assertThat(update(missing, "Missing").getStatusCode().value()).isEqualTo(404);
    assertThat(delete(missing).getStatusCode().value()).isEqualTo(404);
    assertThat(
            http.exchange(
                    "/api/snippets/" + missing.id(),
                    HttpMethod.DELETE,
                    HttpEntity.EMPTY,
                    String.class)
                .getStatusCode()
                .value())
        .isEqualTo(400);
    assertThat(
            http.exchange(
                    "/api/snippets/" + missing.id(),
                    HttpMethod.PUT,
                    new HttpEntity<>(draft("Missing version")),
                    String.class)
                .getStatusCode()
                .value())
        .isEqualTo(400);
  }

  @Test
  void databaseEnforcesConstraintsIndependently() {
    assertThatThrownBy(
            () ->
                jdbc.update(
                    "INSERT INTO snippets(id,title,content,language) VALUES (?, '', 'x', 'JSON')",
                    UUID.randomUUID()))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    assertThatThrownBy(
            () ->
                jdbc.update(
                    "INSERT INTO snippets(id,title,content,language) VALUES (?, 'x', 'x', 'UNSUPPORTED')",
                    UUID.randomUUID()))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    assertThat(
            jdbc.queryForObject(
                "SELECT count(*) FROM flyway_schema_history WHERE success = true AND version = '1'",
                Integer.class))
        .isEqualTo(1);
  }
}
