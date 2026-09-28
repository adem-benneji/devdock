package com.devtools.tools.features.textdiff;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.*;
import java.util.regex.Pattern;

/** Backend implementation of the text-diff tool. */
public final class TextDiffTool implements ToolProcessor {
  @Override
  public String id() {
    return "text-diff";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return textDiff(input, fields.getOrDefault("comparison", ""));
  }

  static List<String> splitLines(String value) {
    var result = new ArrayList<String>();
    var m = Pattern.compile(".*?(?:\\r\\n|\\n|\\r|$)", Pattern.DOTALL).matcher(value);
    while (m.find()) if (!m.group().isEmpty()) result.add(m.group());
    return result;
  }

  static String textDiff(String before, String after) {
    var a = splitLines(before);
    var b = splitLines(after);
    if ((long) (a.size() + 1) * (b.size() + 1) > 2_000_000)
      throw invalid("Text comparison is too complex. Compare smaller documents.");
    int[][] lcs = new int[a.size() + 1][b.size() + 1];
    for (int i = a.size() - 1; i >= 0; i--)
      for (int j = b.size() - 1; j >= 0; j--)
        lcs[i][j] =
            a.get(i).equals(b.get(j))
                ? lcs[i + 1][j + 1] + 1
                : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    var chunks = JSON.createArrayNode();
    int i = 0, j = 0;
    while (i < a.size() || j < b.size()) {
      String kind, text;
      if (i < a.size() && j < b.size() && a.get(i).equals(b.get(j))) {
        kind = "unchanged";
        text = a.get(i++);
        j++;
      } else if (i < a.size() && (j == b.size() || lcs[i + 1][j] >= lcs[i][j + 1])) {
        kind = "removed";
        text = a.get(i++);
      } else {
        kind = "added";
        text = b.get(j++);
      }
      ObjectNode last = chunks.isEmpty() ? null : (ObjectNode) chunks.get(chunks.size() - 1);
      if (last != null && last.path("kind").asText().equals(kind)) {
        last.put("text", last.path("text").asText() + text);
        last.put("lines", last.path("lines").asInt() + 1);
      } else chunks.addObject().put("kind", kind).put("lines", 1).put("text", text);
    }
    return json(Map.of("equal", before.equals(after), "chunks", chunks));
  }
}
