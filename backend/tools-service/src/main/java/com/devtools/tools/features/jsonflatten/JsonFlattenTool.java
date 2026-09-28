package com.devtools.tools.features.jsonflatten;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.*;
import java.util.*;

/** Backend implementation of the json-flatten tool. */
public final class JsonFlattenTool implements ToolProcessor {
  @Override
  public String id() {
    return "json-flatten";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return mode.equals("flatten") ? flatten(parse(input)) : unflatten(parse(input));
  }

  static boolean leaf(JsonNode value) {
    return !value.isContainerNode() || value.isEmpty();
  }

  static String flatten(JsonNode value) {
    var out = JSON.createArrayNode();
    flatten(value, JSON.createArrayNode(), out);
    return json(out);
  }

  static void flatten(JsonNode value, ArrayNode path, ArrayNode out) {
    if (leaf(value)) {
      if (out.size() >= 5000) throw invalid("Use at most 5,000 leaves.");
      out.addObject().set("path", path);
      ((ObjectNode) out.get(out.size() - 1)).set("value", value);
      return;
    }
    if (value.isArray()) {
      for (int i = 0; i < value.size(); i++) {
        var child = path.deepCopy();
        child.add(i);
        flatten(value.get(i), child, out);
      }
    } else
      value
          .fields()
          .forEachRemaining(
              e -> {
                var child = path.deepCopy();
                child.add(e.getKey());
                flatten(e.getValue(), child, out);
              });
  }

  static final class Trie {
    final Map<Object, Trie> children = new LinkedHashMap<>();
    JsonNode value;
  }

  static String unflatten(JsonNode input) {
    if (!input.isArray() || input.isEmpty() || input.size() > 5000)
      throw invalid("Enter 1–5,000 path/value entries.");
    var root = new Trie();
    for (var entry : input) {
      if (!entry.isObject()
          || entry.size() != 2
          || !entry.has("value")
          || !leaf(entry.get("value"))
          || !entry.path("path").isArray()
          || entry.path("path").size() > 64)
        throw invalid("Each entry needs a path array and a primitive or empty-container value.");
      Trie node = root;
      for (var key : entry.get("path")) {
        Object segment;
        if (key.isTextual()) segment = key.textValue();
        else if (key.isIntegralNumber()
            && key.canConvertToInt()
            && key.intValue() >= 0
            && key.intValue() < 5000) segment = key.intValue();
        else throw invalid("Path segments must be strings or indexes 0–4,999.");
        if (node.value != null) throw invalid("Paths conflict: values cannot also have children.");
        node = node.children.computeIfAbsent(segment, k -> new Trie());
      }
      if (node.value != null || !node.children.isEmpty())
        throw invalid("Duplicate or conflicting paths.");
      node.value = entry.get("value");
    }
    return json(build(root));
  }

  static JsonNode build(Trie node) {
    if (node.value != null) return node.value;
    boolean array = node.children.keySet().stream().anyMatch(k -> k instanceof Integer);
    if (array) {
      var out = JSON.createArrayNode();
      for (int i = 0; i < node.children.size(); i++) {
        if (!node.children.containsKey(i))
          throw invalid("Array indexes must be contiguous; do not mix strings and indexes.");
        out.add(build(node.children.get(i)));
      }
      return out;
    }
    var out = JSON.createObjectNode();
    node.children.forEach((key, child) -> out.set((String) key, build(child)));
    return out;
  }
}
