package com.devtools.tools.features.jsonschemagenerator;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.*;

/** Backend implementation of the json-schema-generator tool. */
public final class JsonSchemaGeneratorTool implements ToolProcessor {
  @Override
  public String id() {
    return "json-schema-generator";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    var schema = (ObjectNode) infer(parse(input));
    schema.put("$schema", "https://json-schema.org/draft/2020-12/schema");
    return json(schema);
  }

  static JsonNode infer(JsonNode node) {
    var out = JSON.createObjectNode();
    if (node.isNull()) return out.put("type", "null");
    if (node.isArray()) {
      out.put("type", "array");
      var schemas = new LinkedHashMap<String, JsonNode>();
      node.forEach(
          v -> {
            var s = infer(v);
            schemas.put(compact(s), s);
          });
      out.set(
          "items",
          schemas.size() > 1
              ? JSON.createObjectNode().set("anyOf", JSON.valueToTree(schemas.values()))
              : schemas.isEmpty() ? JSON.createObjectNode() : schemas.values().iterator().next());
      return out;
    }
    if (node.isObject()) {
      out.put("type", "object");
      var props = out.putObject("properties");
      var required = JSON.createArrayNode();
      node.fields()
          .forEachRemaining(
              e -> {
                props.set(e.getKey(), infer(e.getValue()));
                required.add(e.getKey());
              });
      if (!required.isEmpty()) out.set("required", required);
      return out;
    }
    return out.put(
        "type",
        node.isNumber()
            ? (node.decimalValue().stripTrailingZeros().scale() <= 0 ? "integer" : "number")
            : node.isBoolean() ? "boolean" : "string");
  }
}
