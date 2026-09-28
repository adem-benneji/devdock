package com.devtools.tools.features.jsonstring;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.Map;

/** Backend implementation of the json-string tool. */
public final class JsonStringTool implements ToolProcessor {
  @Override
  public String id() {
    return "json-string";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    if (mode.equals("escape")) return compact(input);
    var v = parse(input);
    if (!v.isTextual()) throw invalid("Enter one quoted JSON string.");
    return v.textValue();
  }
}
