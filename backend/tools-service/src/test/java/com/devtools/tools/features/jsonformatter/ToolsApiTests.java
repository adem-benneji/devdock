package com.devtools.tools.features.jsonformatter;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ToolsApiTests {
  @Autowired TestRestTemplate http;

  @Test
  void advertisesOnlyImplementedTools() {
    var response = http.getForEntity("/api/tools", ToolsController.Tool[].class);
    assertThat(response.getStatusCode().value()).isEqualTo(200);
    assertThat(response.getBody()).hasSize(1);
    assertThat(response.getBody()[0].id()).isEqualTo("json-formatter");
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "null",
        "true",
        "false",
        "123456789012345678901234567890",
        "0.123456789012345678901234567890",
        "1e999",
        "-0",
        "[]",
        "{}",
        "[1,true,null]",
        "\"hello 🌍\""
      })
  void preservesValuesAndNumberLexemes(String input) {
    var response =
        http.postForEntity(
            "/api/tools/json-formatter",
            Map.of("input", input, "mode", "MINIFY"),
            ToolsController.JsonResult.class);
    assertThat(response.getStatusCode().value()).isEqualTo(200);
    assertThat(response.getBody().output()).isEqualTo(input);
  }

  @Test
  void formatsAndMinifiesNestedDocuments() {
    String input = "{\"a\":[1,2],\"b\":{\"c\":true}}";
    var formatted =
        http.postForObject(
            "/api/tools/json-formatter",
            Map.of("input", input, "mode", "FORMAT"),
            ToolsController.JsonResult.class);
    assertThat(formatted.output()).contains("\n  \"a\"");
    var compact =
        http.postForObject(
            "/api/tools/json-formatter",
            Map.of("input", formatted.output(), "mode", "MINIFY"),
            ToolsController.JsonResult.class);
    assertThat(compact.output()).isEqualTo(input);
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "{",
        "[1,]",
        "{\"a\":1,\"a\":2}",
        "{} {}",
        "true false",
        "NaN",
        "// comment",
        "{\"secret-token\": BROKEN}"
      })
  void rejectsMalformedOrAmbiguousJsonWithoutEchoingInput(String input) {
    var response =
        http.postForEntity(
            "/api/tools/json-formatter", Map.of("input", input, "mode", "FORMAT"), String.class);
    assertThat(response.getStatusCode().value()).isEqualTo(400);
    assertThat(response.getBody()).contains("INVALID_JSON").doesNotContain("secret-token");
  }

  @Test
  void rejectsDeepLargeBlankOrIncompleteRequests() {
    for (String input :
        new String[] {"[".repeat(101) + "0" + "]".repeat(101), " ", "x".repeat(100001)}) {
      assertThat(
              http.postForEntity(
                      "/api/tools/json-formatter",
                      Map.of("input", input, "mode", "FORMAT"),
                      String.class)
                  .getStatusCode()
                  .value())
          .isEqualTo(400);
    }
    for (var request :
        java.util.List.of(
            Map.of("input", "{}"),
            Map.of("input", "{}", "mode", "BOGUS"),
            Map.of("input", "{}", "mode", "FORMAT", "unknown", true))) {
      assertThat(
              http.postForEntity("/api/tools/json-formatter", request, String.class)
                  .getStatusCode()
                  .value())
          .isEqualTo(400);
    }
  }

  @Test
  void boundsWhitespaceExpansionButCanStillMinify() {
    String input = "[".repeat(99) + "[" + "0,".repeat(10000) + "0]" + "]".repeat(99);
    var formatted =
        http.postForEntity(
            "/api/tools/json-formatter", Map.of("input", input, "mode", "FORMAT"), String.class);
    assertThat(formatted.getStatusCode().value()).isEqualTo(400);
    assertThat(formatted.getBody()).contains("OUTPUT_TOO_LARGE");
    assertThat(
            http.postForEntity(
                    "/api/tools/json-formatter",
                    Map.of("input", input, "mode", "MINIFY"),
                    String.class)
                .getStatusCode()
                .value())
        .isEqualTo(200);
  }
}
