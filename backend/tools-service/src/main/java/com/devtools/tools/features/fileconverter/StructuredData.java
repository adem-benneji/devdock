package com.devtools.tools.features.fileconverter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** Shared data-format capability used by file and text APIs. */
public final class StructuredData {
  private StructuredData() {}

  public static String convert(String input, String source, String target) throws IOException {
    return new String(
        DataConversions.write(DataConversions.parse(input, source), target),
        StandardCharsets.UTF_8);
  }

  public static List<List<String>> csv(String input) throws IOException {
    return DataConversions.table(input.replaceFirst("^\uFEFF", ""), ',');
  }
}
