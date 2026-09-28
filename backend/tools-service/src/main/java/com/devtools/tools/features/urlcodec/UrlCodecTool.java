package com.devtools.tools.features.urlcodec;

import static com.devtools.tools.shared.UrlSupport.*;
import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.Map;

/** Backend implementation of the url-codec tool. */
public final class UrlCodecTool implements ToolProcessor {
  @Override
  public String id() {
    return "url-codec";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return mode.equals("decode") ? decodeComponent(input) : encodeComponent(input);
  }
}
