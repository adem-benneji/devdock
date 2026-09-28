package com.devtools.tools.utilities;

import static com.devtools.tools.utilities.UtilitySupport.JSON;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.*;

public abstract class ToolExampleTests {
  protected abstract String toolId();

  @TestFactory
  protected Stream<DynamicTest> documentedExamples() throws Exception {
    var examples =
        JSON.readTree(getClass().getResourceAsStream("/tools/" + toolId() + "/examples.json"));
    return java.util.stream.StreamSupport.stream(examples.spliterator(), false)
        .map(
            example ->
                DynamicTest.dynamicTest(
                    example.path("id").asText() + ":" + example.path("mode").asText(),
                    () -> {
                      Map<String, String> fields =
                          JSON.convertValue(
                              example.path("fields"),
                              new com.fasterxml.jackson.core.type.TypeReference<>() {});
                      if (example.has("expectedError")) {
                        var error =
                            assertThrows(
                                com.devtools.tools.ApiException.class,
                                () ->
                                    UtilityEngine.execute(
                                        example.path("id").asText(),
                                        new UtilityEngine.Request(
                                            example.path("input").asText(),
                                            example.path("mode").asText(),
                                            fields)));
                        assertTrue(
                            error.getMessage().contains(example.path("expectedError").asText()),
                            error.getMessage());
                        return;
                      }
                      var result =
                          UtilityEngine.execute(
                              example.path("id").asText(),
                              new UtilityEngine.Request(
                                  example.path("input").asText(),
                                  example.path("mode").asText(),
                                  fields));
                      assertNotNull(result.output());
                      assertFalse(result.output().isEmpty());
                      if (example.has("expected")) {
                        if (example.path("jsonResult").asBoolean())
                          assertEquals(
                              JSON.readTree(example.path("expected").asText()),
                              JSON.readTree(result.output()));
                        else assertEquals(example.path("expected").asText(), result.output());
                      }
                    }));
  }
}
