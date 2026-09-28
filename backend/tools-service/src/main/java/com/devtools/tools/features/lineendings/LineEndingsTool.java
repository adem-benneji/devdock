package com.devtools.tools.features.lineendings;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.Map;
import java.util.regex.Matcher;

/** Backend implementation of the line-endings tool. */
public final class LineEndingsTool implements ToolProcessor {
  @Override
  public String id() {
    return "line-endings";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return endings(input, mode);
  }

  static String endings(String input, String mode) {
    if (mode.equals("inspect")) {
      int crlf = count(input, "\r\n");
      return json(
          Map.of(
              "crlf",
              crlf,
              "lf",
              count(input, "\n") - crlf,
              "cr",
              count(input, "\r") - crlf,
              "leadingBom",
              input.startsWith("\uFEFF")));
    }
    if (mode.equals("strip-bom")) return input.replaceFirst("^\uFEFF", "");
    String nl =
        switch (mode) {
          case "lf" -> "\n";
          case "crlf" -> "\r\n";
          case "cr" -> "\r";
          default -> throw invalid("Choose a newline style.");
        };
    return input.replaceAll("\\r\\n|\\r|\\n", Matcher.quoteReplacement(nl));
  }

  static int count(String text, String token) {
    return (text.length() - text.replace(token, "").length()) / token.length();
  }
}
