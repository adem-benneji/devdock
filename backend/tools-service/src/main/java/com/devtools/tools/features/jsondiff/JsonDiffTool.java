package com.devtools.tools.features.jsondiff;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.util.*;

/** Backend implementation of the json-diff tool. */
public final class JsonDiffTool implements ToolProcessor {
  @Override
  public String id() {
    return "json-diff";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return diff(parse(input), parse(fields.getOrDefault("comparison", "")));
  }

  static String diff(JsonNode a, JsonNode b) {
    var changes = JSON.createArrayNode();
    diff(a, b, "", changes);
    return json(Map.of("equal", changes.isEmpty(), "changes", changes));
  }

  static void diff(JsonNode a, JsonNode b, String path, ArrayNode changes) {
    if (a.equals(b)
        || (a.isNumber() && b.isNumber() && a.decimalValue().compareTo(b.decimalValue()) == 0))
      return;
    if (!a.isContainerNode() || !b.isContainerNode() || a.isArray() != b.isArray()) {
      change(changes, "changed", path, a, b);
      return;
    }
    var keys = new LinkedHashSet<String>();
    if (a.isArray()) {
      for (int i = 0; i < Math.max(a.size(), b.size()); i++) keys.add(String.valueOf(i));
    } else {
      a.fieldNames().forEachRemaining(keys::add);
      b.fieldNames().forEachRemaining(keys::add);
    }
    for (String key : keys) {
      var av = a.isArray() ? a.get(Integer.parseInt(key)) : a.get(key);
      var bv = b.isArray() ? b.get(Integer.parseInt(key)) : b.get(key);
      String p = path + "/" + key.replace("~", "~0").replace("/", "~1");
      if (av == null) change(changes, "added", p, null, bv);
      else if (bv == null) change(changes, "removed", p, av, null);
      else diff(av, bv, p, changes);
    }
  }

  static void change(ArrayNode changes, String kind, String path, JsonNode before, JsonNode after) {
    if (changes.size() >= 500) throw invalid("More than 500 changes. Compare smaller documents.");
    var change = changes.addObject().put("kind", kind).put("path", path);
    if (before != null) change.set("before", before);
    if (after != null) change.set("after", after);
  }
}
