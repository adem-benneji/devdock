package com.devtools.tools.features.htmlentities;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.Map;
import java.util.regex.Pattern;

/** Backend implementation of the html-entities tool. */
public final class HtmlEntitiesTool implements ToolProcessor {
  @Override
  public String id() {
    return "html-entities";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return html(input, mode);
  }

  static String html(String input, String mode) {
    utf(input);
    if (mode.equals("encode"))
      return org.jsoup.nodes.Entities.escape(
              input,
              new org.jsoup.nodes.Document.OutputSettings()
                  .escapeMode(org.jsoup.nodes.Entities.EscapeMode.extended)
                  .charset(java.nio.charset.StandardCharsets.US_ASCII))
          .replace("\"", "&quot;")
          .replace("'", "&#x27;");
    var m = Pattern.compile("&([^;\\s<&]*);?").matcher(input);
    while (m.find()) {
      String e = m.group();
      if (!e.endsWith(";") || org.jsoup.parser.Parser.unescapeEntities(e, false).equals(e))
        throw invalid("Enter valid HTML entities including semicolons.");
    }
    return org.jsoup.parser.Parser.unescapeEntities(input, false);
  }
}
