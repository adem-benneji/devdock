package com.devtools.tools.features.yamljson;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.features.fileconverter.StructuredData;
import com.devtools.tools.utilities.ToolProcessor;
import java.util.Map;

/** Backend implementation of the yaml-json tool. */
public final class YamlJsonTool implements ToolProcessor {
  @Override
  public String id() {
    return "yaml-json";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    String result =
        StructuredData.convert(
            input,
            mode.equals("to-json") ? "yaml" : "json",
            mode.equals("to-json") ? "json" : "yaml");
    return mode.equals("to-json") ? json(parse(result)) : result;
  }
}
