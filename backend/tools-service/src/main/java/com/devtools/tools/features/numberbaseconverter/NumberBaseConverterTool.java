package com.devtools.tools.features.numberbaseconverter;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.math.BigInteger;
import java.util.*;

/** Backend implementation of the number-base-converter tool. */
public final class NumberBaseConverterTool implements ToolProcessor {
  @Override
  public String id() {
    return "number-base-converter";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return bases(input, mode);
  }

  static String bases(String input, String mode) {
    int radix =
        switch (mode) {
          case "binary" -> 2;
          case "octal" -> 8;
          case "hex" -> 16;
          default -> 10;
        };
    String digits = input.strip().replaceFirst("^[+-]", "");
    if (digits.isEmpty() || digits.length() > 4096 || !digits.matches("[0-9a-fA-F]+"))
      throw invalid(
          "Enter valid base-" + radix + " digits (1–4,096), without prefixes or separators.");
    try {
      BigInteger n = new BigInteger(input.strip(), radix);
      return json(
          Map.of(
              "decimal",
              n.toString(10),
              "hexadecimal",
              n.toString(16).toUpperCase(Locale.ROOT),
              "binary",
              n.toString(2),
              "octal",
              n.toString(8)));
    } catch (NumberFormatException e) {
      throw invalid("Enter valid base-" + radix + " digits.");
    }
  }
}
