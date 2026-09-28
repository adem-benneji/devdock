package com.devtools.tools.features.uuidgenerator;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;

/** Backend implementation of the uuid-generator tool. */
public final class UuidGeneratorTool implements ToolProcessor {
  @Override
  public String id() {
    return "uuid-generator";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    int count = integer(input, 1, 100);
    var values = new ArrayList<String>();
    for (int i = 0; i < count; i++) values.add(UUID.randomUUID().toString());
    return String.join("\n", values);
  }
}
