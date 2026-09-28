package com.devtools.tools.features.jsonlines;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;

/** Backend implementation of the json-lines tool. */
public final class JsonLinesTool implements ToolProcessor {
  @Override
  public String id() {
    return "json-lines";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return jsonLines(input, mode);
  }

  static String jsonLines(String input, String mode) {
    if (mode.equals("to-lines")) {
      var array = parse(input);
      if (!array.isArray() || array.size() > 5000)
        throw invalid("Enter a JSON array of at most 5,000 items.");
      var rows = new ArrayList<String>();
      array.forEach(v -> rows.add(compact(v)));
      return String.join("\n", rows);
    }
    var lines = new ArrayList<>(Arrays.asList(input.split("\\r\\n|\\r|\\n", -1)));
    if (lines.getLast().isEmpty()) lines.removeLast();
    if (lines.size() > 5000) throw invalid("Use at most 5,000 JSON Lines records.");
    var array = JSON.createArrayNode();
    for (String line : lines) {
      try {
        array.add(parse(line));
      } catch (Exception e) {
        throw invalid("Line " + (array.size() + 1) + ": enter valid JSON.");
      }
    }
    return json(array);
  }
}
