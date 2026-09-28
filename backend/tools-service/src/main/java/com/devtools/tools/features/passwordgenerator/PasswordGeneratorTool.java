package com.devtools.tools.features.passwordgenerator;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.security.SecureRandom;
import java.util.Map;

/** Backend implementation of the password-generator tool. */
public final class PasswordGeneratorTool implements ToolProcessor {
  @Override
  public String id() {
    return "password-generator";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    int count = integer(input, 8, 128);
    String alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
            + (mode.equals("mixed") ? "!@#$%^&*()-_=+[]{}:,.?" : "");
    var result = new StringBuilder();
    for (int i = 0; i < count; i++)
      result.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
    return result.toString();
  }

  private static final SecureRandom RANDOM = new SecureRandom();
}
