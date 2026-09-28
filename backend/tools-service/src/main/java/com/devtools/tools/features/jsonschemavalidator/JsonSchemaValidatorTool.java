package com.devtools.tools.features.jsonschemavalidator;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.fasterxml.jackson.databind.JsonNode;
import com.networknt.schema.*;
import java.util.*;

/** Backend implementation of the json-schema-validator tool. */
public final class JsonSchemaValidatorTool implements ToolProcessor {
  @Override
  public String id() {
    return "json-schema-validator";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return schema(input, mode, fields.getOrDefault("schema", ""));
  }

  static final Set<String> KEYWORDS =
      Set.of(
          "$schema",
          "$id",
          "$ref",
          "$defs",
          "definitions",
          "$comment",
          "$anchor",
          "$dynamicAnchor",
          "$dynamicRef",
          "type",
          "enum",
          "const",
          "properties",
          "patternProperties",
          "additionalProperties",
          "propertyNames",
          "required",
          "minProperties",
          "maxProperties",
          "dependencies",
          "dependentRequired",
          "dependentSchemas",
          "items",
          "prefixItems",
          "additionalItems",
          "contains",
          "minContains",
          "maxContains",
          "minItems",
          "maxItems",
          "uniqueItems",
          "minimum",
          "maximum",
          "exclusiveMinimum",
          "exclusiveMaximum",
          "multipleOf",
          "minLength",
          "maxLength",
          "pattern",
          "format",
          "allOf",
          "anyOf",
          "oneOf",
          "not",
          "if",
          "then",
          "else",
          "title",
          "description",
          "default",
          "examples",
          "readOnly",
          "writeOnly",
          "deprecated",
          "contentEncoding",
          "contentMediaType",
          "contentSchema",
          "unevaluatedProperties",
          "unevaluatedItems");

  static void checkSchema(JsonNode schema) {
    if (schema.isBoolean()) return;
    if (!schema.isObject()) throw invalid("Schema nodes must be objects or booleans.");
    schema
        .fields()
        .forEachRemaining(
            e -> {
              String key = e.getKey();
              JsonNode v = e.getValue();
              if (!KEYWORDS.contains(key))
                throw invalid("Unknown or unsupported schema keyword: " + key);
              if (Set.of("$ref", "$dynamicRef").contains(key)
                  && (!v.isTextual() || !v.asText().startsWith("#")))
                throw invalid("Remote references are never fetched. Use local # references.");
              if (Set.of(
                      "properties", "patternProperties", "$defs", "definitions", "dependentSchemas")
                  .contains(key)) {
                if (!v.isObject()) throw invalid("Schema properties/definitions must be objects.");
                v.forEach(JsonSchemaValidatorTool::checkSchema);
              } else if (Set.of("allOf", "anyOf", "oneOf", "prefixItems").contains(key)) {
                if (!v.isArray()) throw invalid("Schema composition requires an array.");
                v.forEach(JsonSchemaValidatorTool::checkSchema);
              } else if (Set.of(
                      "items",
                      "additionalItems",
                      "additionalProperties",
                      "unevaluatedProperties",
                      "unevaluatedItems",
                      "contains",
                      "not",
                      "if",
                      "then",
                      "else",
                      "propertyNames",
                      "contentSchema")
                  .contains(key)) {
                if (v.isArray()) v.forEach(JsonSchemaValidatorTool::checkSchema);
                else checkSchema(v);
              }
            });
  }

  static String schema(String input, String mode, String definition) {
    JsonNode data = parse(input), schema = parse(definition);
    checkSchema(schema);
    String expected =
        mode.equals("2020")
            ? "https://json-schema.org/draft/2020-12/schema"
            : "http://json-schema.org/draft-07/schema#";
    if (schema.has("$schema") && !schema.path("$schema").asText().equals(expected))
      throw invalid("The schema dialect must match the selected mode.");
    try {
      var factory =
          JsonSchemaFactory.getInstance(
              mode.equals("2020") ? SpecVersion.VersionFlag.V202012 : SpecVersion.VersionFlag.V7,
              b ->
                  b.schemaLoaders(
                      loaders ->
                          loaders.add(
                              iri -> {
                                throw invalid("External schema resources are never fetched.");
                              })));
      var config =
          SchemaValidatorsConfig.builder()
              .formatAssertionsEnabled(true)
              .typeLoose(false)
              .pathType(PathType.JSON_POINTER)
              .build();
      var errors = factory.getSchema(schema, config).validate(data);
      var out = new ArrayList<Map<String, Object>>();
      for (var e : errors) {
        if (out.size() == 100) break;
        out.add(
            Map.of(
                "instancePath",
                e.getInstanceLocation().toString(),
                "schemaPath",
                e.getSchemaLocation().toString(),
                "keyword",
                e.getType(),
                "message",
                e.getMessage(),
                "params",
                Map.of()));
      }
      return json(
          Map.of(
              "valid",
              errors.isEmpty(),
              "dialect",
              mode.equals("2020") ? "2020-12" : "draft-07",
              "errorsTruncated",
              errors.size() > 100,
              "errors",
              out,
              "errorReporting",
              "At most 100 validation errors are returned."));
    } catch (com.devtools.tools.ApiException e) {
      throw e;
    } catch (Exception e) {
      throw invalid("Invalid or unsupported schema. Check keyword types and local references.");
    }
  }
}
