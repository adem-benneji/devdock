package com.devtools.tools.utilities;

import java.util.Map;

/** A business capability; transport and process isolation live outside tool modules. */
public interface ToolProcessor {
  String id();

  String execute(String input, String mode, Map<String, String> fields) throws Exception;
}
