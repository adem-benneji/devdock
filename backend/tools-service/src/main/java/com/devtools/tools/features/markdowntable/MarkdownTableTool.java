package com.devtools.tools.features.markdowntable;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.features.fileconverter.StructuredData;
import com.devtools.tools.utilities.ToolProcessor;
import java.io.IOException;
import java.util.*;

/** Backend implementation of the markdown-table tool. */
public final class MarkdownTableTool implements ToolProcessor {
  @Override
  public String id() {
    return "markdown-table";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return markdown(input);
  }

  static String markdown(String input) throws IOException {
    var rows = StructuredData.csv(input);
    var result = new ArrayList<String>();
    result.add(markdownLine(rows.getFirst()));
    result.add(markdownLine(Collections.nCopies(rows.getFirst().size(), "---")));
    for (var row : rows.subList(1, rows.size())) result.add(markdownLine(row));
    return String.join("\n", result);
  }

  static String markdownLine(List<String> row) {
    return "| "
        + String.join(
            " | ",
            row.stream()
                .map(
                    v ->
                        v.replace("&", "&amp;")
                            .replace("<", "&lt;")
                            .replace(">", "&gt;")
                            .replace("\\", "&#92;")
                            .replace("|", "&#124;")
                            .replace("`", "&#96;")
                            .replace("*", "&#42;")
                            .replace("_", "&#95;")
                            .replace("[", "&#91;")
                            .replace("]", "&#93;")
                            .replaceAll("\\r\\n|\\r|\\n", "<br>"))
                .toList())
        + " |";
  }
}
