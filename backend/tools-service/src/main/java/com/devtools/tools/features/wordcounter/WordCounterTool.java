package com.devtools.tools.features.wordcounter;

import static com.devtools.tools.shared.UnicodeSegments.segments;
import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.Map;

/** Backend implementation of the word-counter tool. */
public final class WordCounterTool implements ToolProcessor {
  @Override
  public String id() {
    return "word-counter";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return words(input);
  }

  static String words(String input) {
    var chars = segments(input, false);
    int words = segments(input, true).size();
    return json(
        Map.of(
            "words",
            words,
            "characters",
            chars.size(),
            "charactersWithoutWhitespace",
            chars.stream().filter(v -> !v.isBlank()).count(),
            "lines",
            input.isEmpty() ? 0 : input.split("\\r\\n|\\r|\\n", -1).length,
            "utf8Bytes",
            utf(input).length,
            "estimatedReadingSeconds",
            (int) Math.ceil(words * .3)));
  }
}
