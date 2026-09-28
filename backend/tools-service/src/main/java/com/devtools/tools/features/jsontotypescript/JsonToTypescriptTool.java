package com.devtools.tools.features.jsontotypescript;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;

/** Backend implementation of the json-to-typescript tool. */
public final class JsonToTypescriptTool implements ToolProcessor {
  @Override
  public String id() {
    return "json-to-typescript";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return "export type Root = " + typescript(parse(input), 0) + ";";
  }

  static String typescript(JsonNode node, int depth) {
    if (node.isNull()) return "null";
    if (node.isTextual()) return "string";
    if (node.isBoolean()) return "boolean";
    if (node.isNumber()) return "number";
    if (node.isArray()) {
      var types = new LinkedHashSet<String>();
      node.forEach(v -> types.add(typescript(v, depth)));
      return bounded("Array<" + (types.isEmpty() ? "unknown" : String.join(" | ", types)) + ">");
    }
    if (node.isEmpty()) return "Record<string, unknown>";
    var lines = new ArrayList<String>();
    node.fields()
        .forEachRemaining(
            e ->
                lines.add(
                    "  ".repeat(depth + 1)
                        + compact(e.getKey())
                        + ": "
                        + typescript(e.getValue(), depth + 1)
                        + ";"));
    return bounded("{\n" + String.join("\n", lines) + "\n" + "  ".repeat(depth) + "}");
  }
}
