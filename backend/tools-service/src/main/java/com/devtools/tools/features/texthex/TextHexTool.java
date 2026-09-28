package com.devtools.tools.features.texthex;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;

/** Backend implementation of the text-hex tool. */
public final class TextHexTool implements ToolProcessor {
  @Override
  public String id() {
    return "text-hex";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return mode.equals("encode")
        ? HexFormat.ofDelimiter(" ").formatHex(utf(input))
        : fromHex(input);
  }

  static String fromHex(String input) {
    try {
      String hex = input.replaceAll("\\s", "");
      if (!hex.matches("(?:[a-fA-F0-9]{2})*"))
        throw invalid("Enter complete hexadecimal byte pairs.");
      return text(HexFormat.of().parseHex(hex));
    } catch (IllegalArgumentException e) {
      throw invalid("Enter complete hexadecimal byte pairs.");
    }
  }
}
