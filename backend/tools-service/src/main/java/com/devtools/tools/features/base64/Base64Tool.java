package com.devtools.tools.features.base64;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;

/** Backend implementation of the base64 tool. */
public final class Base64Tool implements ToolProcessor {
  @Override
  public String id() {
    return "base64";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return mode.equals("decode")
        ? text(base64(input))
        : Base64.getEncoder().encodeToString(utf(input));
  }
}
