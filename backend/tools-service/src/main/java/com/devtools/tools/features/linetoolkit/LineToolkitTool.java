package com.devtools.tools.features.linetoolkit;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;

/** Backend implementation of the line-toolkit tool. */
public final class LineToolkitTool implements ToolProcessor {
  @Override
  public String id() {
    return "line-toolkit";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return lines(input, mode);
  }

  static String lines(String input, String mode) {
    if (input.isEmpty()) return "";
    boolean ending = input.matches("(?s).*(?:\\r\\n|\\r|\\n)$");
    var rows = new ArrayList<>(Arrays.asList(input.split("\\r\\n|\\r|\\n", -1)));
    if (ending) rows.removeLast();
    switch (mode) {
      case "unique" -> rows = new ArrayList<>(new LinkedHashSet<>(rows));
      case "sort" -> Collections.sort(rows);
      case "reverse" -> Collections.reverse(rows);
      case "trim" -> rows.replaceAll(String::strip);
      case "nonblank" -> rows.removeIf(String::isBlank);
      default -> throw invalid("Choose a line operation.");
    }
    return String.join("\n", rows) + (ending && !rows.isEmpty() ? "\n" : "");
  }
}
