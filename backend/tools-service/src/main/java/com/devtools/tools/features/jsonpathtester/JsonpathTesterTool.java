package com.devtools.tools.features.jsonpathtester;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;
import java.util.regex.Pattern;

/** Backend implementation of the jsonpath-tester tool. */
public final class JsonpathTesterTool implements ToolProcessor {
  @Override
  public String id() {
    return "jsonpath-tester";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return query(parse(input), fields.getOrDefault("query", ""));
  }

  private record Match(String path, JsonNode value) {}

  private record Token(String value, boolean recursive, boolean bracket) {}

  private static final Pattern SEGMENT =
      Pattern.compile(
          "(\\.\\.?)([\\p{L}\\p{N}_$*-]+)|(\\.\\.)?\\[(\\*|-?\\d+|-?\\d*:-?\\d*(?::[1-9]\\d*)?|'(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\")\\]");

  static String query(JsonNode root, String query) {
    query = query.strip();
    if (!query.startsWith("$") || query.length() > 500)
      throw invalid("Enter a JSONPath starting with $, up to 500 characters.");
    var tokens = new ArrayList<Token>();
    int offset = 1;
    var matcher = SEGMENT.matcher(query);
    while (offset < query.length()) {
      matcher.region(offset, query.length());
      if (!matcher.lookingAt())
        throw invalid("Invalid or unsupported JSONPath. Filters and scripts are disabled.");
      tokens.add(
          new Token(
              matcher.group(2) != null ? matcher.group(2) : matcher.group(4),
              "..".equals(matcher.group(1)) || matcher.group(3) != null,
              matcher.group(4) != null));
      offset = matcher.end();
    }
    List<Match> matches = List.of(new Match("$", root));
    for (var token : tokens) {
      var next = new ArrayList<Match>();
      for (var match : matches) select(match, token, next);
      matches = next;
    }
    return json(Map.of("count", matches.size(), "matches", matches));
  }

  static void add(List<Match> out, Match value) {
    if (out.size() >= 500) throw invalid("More than 500 matches. Use a narrower query.");
    out.add(value);
  }

  static Match child(Match parent, String key, JsonNode value) {
    return new Match(
        parent.path
            + (parent.value.isArray()
                ? "[" + key + "]"
                : "['" + key.replace("\\", "\\\\").replace("'", "\\'") + "']"),
        value);
  }

  static List<Match> children(Match parent) {
    var values = new ArrayList<Match>();
    if (parent.value.isArray()) {
      for (int i = 0; i < parent.value.size(); i++)
        values.add(child(parent, "" + i, parent.value.get(i)));
    } else if (parent.value.isObject())
      parent
          .value
          .fields()
          .forEachRemaining(e -> values.add(child(parent, e.getKey(), e.getValue())));
    return values;
  }

  static void select(Match parent, Token token, List<Match> out) {
    String key = token.value;
    JsonNode value = parent.value;
    if (key.equals("*")) {
      for (var c : children(parent)) add(out, c);
    } else if (token.bracket && key.matches("-?\\d*:-?\\d*(?::[1-9]\\d*)?")) {
      if (value.isArray()) {
        String[] p = key.split(":", -1);
        int size = value.size(),
            start = bound(p[0], 0, size),
            end = bound(p[1], size, size),
            step = p.length == 3 ? parseIndex(p[2]) : 1;
        for (int i = start; i < end; i += step) {
          add(out, child(parent, "" + i, value.get(i)));
          if ((long) i + step > Integer.MAX_VALUE) break;
        }
      }
    } else if (token.bracket && key.matches("-?\\d+")) {
      if (value.isArray()) {
        int index = parseIndex(key);
        if (index < 0) index += value.size();
        if (index >= 0 && index < value.size())
          add(out, child(parent, "" + index, value.get(index)));
      }
    } else {
      if (token.bracket) {
        if (key.startsWith("\"")) key = parse(key).asText();
        else key = key.substring(1, key.length() - 1).replace("\\'", "'").replace("\\\\", "\\");
      }
      if (value.isObject() && value.has(key)) add(out, child(parent, key, value.get(key)));
    }
    if (token.recursive) for (var c : children(parent)) select(c, token, out);
  }

  static int parseIndex(String value) {
    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException e) {
      throw invalid("JSONPath index is outside the supported range.");
    }
  }

  static int bound(String s, int fallback, int size) {
    if (s.isEmpty()) return fallback;
    int n = parseIndex(s);
    return Math.max(0, Math.min(size, n < 0 ? n + size : n));
  }
}
