package com.devtools.tools.features.unicodeinspector;

import static com.devtools.tools.shared.UnicodeSegments.segments;
import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.text.Normalizer;
import java.util.*;

/** Backend implementation of the unicode-inspector tool. */
public final class UnicodeInspectorTool implements ToolProcessor {
  @Override
  public String id() {
    return "unicode-inspector";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return unicode(input, mode);
  }

  static String unicode(String input, String mode) {
    utf(input);
    if (!mode.equals("inspect")) return Normalizer.normalize(input, Normalizer.Form.valueOf(mode));
    var points = new ArrayList<Map<String, Object>>();
    for (int i = 0; i < input.length(); ) {
      int c = input.codePointAt(i);
      String ch = new String(Character.toChars(c));
      points.add(
          Map.of(
              "character",
              ch,
              "codePoint",
              String.format("U+%04X", c),
              "utf16Offset",
              i,
              "utf8Hex",
              HexFormat.ofDelimiter(" ").formatHex(utf(ch))));
      i += ch.length();
      if (points.size() > 1000) throw invalid("Inspect at most 1,000 Unicode code points.");
    }
    return json(
        Map.of(
            "codePoints",
            points.size(),
            "utf16Units",
            input.length(),
            "utf8Bytes",
            utf(input).length,
            "graphemes",
            segments(input, false).size(),
            "points",
            points));
  }
}
