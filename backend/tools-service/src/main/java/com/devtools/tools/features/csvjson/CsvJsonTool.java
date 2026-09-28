package com.devtools.tools.features.csvjson;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.features.fileconverter.StructuredData;
import com.devtools.tools.utilities.ToolProcessor;
import java.util.Map;

/** Backend implementation of the csv-json tool. */
public final class CsvJsonTool implements ToolProcessor {
  @Override
  public String id() {
    return "csv-json";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    String out =
        StructuredData.convert(
            input,
            mode.equals("to-json") ? "csv" : "json",
            mode.equals("to-json") ? "json" : "csv");
    return mode.equals("to-csv") ? out.replaceFirst("\\r\\n$", "") : json(parse(out));
  }
}
