package com.devtools.tools.features.caseconverter;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;
import java.util.regex.Pattern;

/** Backend implementation of the case-converter tool. */
public final class CaseConverterTool implements ToolProcessor {
  @Override
  public String id() {
    return "case-converter";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return changeCase(input, mode);
  }

  static String changeCase(String input, String mode) {
    if (mode.equals("upper")) return input.toUpperCase(Locale.ROOT);
    if (mode.equals("lower")) return input.toLowerCase(Locale.ROOT);
    String split =
        input
            .replaceAll("(\\p{Lu}+)(\\p{Lu}\\p{Ll})", "$1 $2")
            .replaceAll("([\\p{Ll}\\p{N}])(\\p{Lu})", "$1 $2");
    var m = Pattern.compile("[\\p{L}\\p{N}]+").matcher(split);
    var words = new ArrayList<String>();
    while (m.find()) words.add(m.group().toLowerCase(Locale.ROOT));
    if (words.isEmpty()) throw invalid("Enter text containing letters or numbers.");
    if (mode.equals("camel")) {
      for (int i = 1; i < words.size(); i++) {
        String word = words.get(i);
        words.set(i, word.substring(0, 1).toUpperCase(Locale.ROOT) + word.substring(1));
      }
      return String.join("", words);
    }
    return String.join(mode.equals("snake") ? "_" : "-", words);
  }
}
