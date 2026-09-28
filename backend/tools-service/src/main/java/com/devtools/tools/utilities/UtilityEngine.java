package com.devtools.tools.utilities;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.*;
import java.io.IOException;
import java.util.*;

/** Pure Java engines. HTTP handlers delegate execution to bounded child JVM jobs. */
public final class UtilityEngine {
  @io.swagger.v3.oas.annotations.media.Schema(
      name = "UtilityRequest",
      requiredProperties = {"input", "mode"})
  public record Request(
      @NotNull @Size(max = 100000) String input,
      @NotBlank String mode,
      Map<String, String> fields) {}

  @io.swagger.v3.oas.annotations.media.Schema(
      name = "UtilityOutput",
      requiredProperties = {"toolId", "output"})
  public record Result(String toolId, String output) {}

  private static final JsonNode DEFINITIONS;

  static {
    var definitions = JSON.createObjectNode();
    for (String id : ToolRegistry.TOOLS.keySet()) {
      try (var input =
          UtilityEngine.class.getResourceAsStream("/tools/" + id + "/definition.json")) {
        if (input == null) throw new IOException("Missing definition for " + id);
        definitions.set(id, JSON.readTree(input));
      } catch (IOException error) {
        throw new ExceptionInInitializerError(error);
      }
    }
    DEFINITIONS = definitions;
  }

  public static JsonNode definitions() {
    return DEFINITIONS.deepCopy();
  }

  public static void validate(String id, Request request) {
    var config = DEFINITIONS.get(id);
    if (config == null) throw invalid("Unknown tool.");
    if (request == null || request.input() == null || request.input().length() > 100000)
      throw invalid("Use at most 100,000 input characters.");
    boolean valid = false;
    for (var mode : config.get("modes"))
      if (mode.path("value").asText().equals(request.mode())) valid = true;
    if (!valid) throw invalid("Choose an available tool mode.");
    Map<String, Integer> fields = new HashMap<>();
    for (var field : config.path("fields"))
      fields.put(field.path("key").asText(), field.path("maxLength").asInt(100000));
    if (request.fields() != null)
      request
          .fields()
          .forEach(
              (key, value) -> {
                if (!fields.containsKey(key) || value == null || value.length() > fields.get(key))
                  throw invalid("Invalid or oversized tool field: " + key);
              });
  }

  public static Result execute(String id, Request request) {
    validate(id, request);
    var fields = request.fields() == null ? Map.<String, String>of() : request.fields();
    try {
      String output = ToolRegistry.TOOLS.get(id).execute(request.input(), request.mode(), fields);
      return new Result(id, bounded(output));
    } catch (com.devtools.tools.ApiException e) {
      throw e;
    } catch (Exception e) {
      throw invalid("The operation could not complete. Check the input and selected mode.");
    }
  }
}
