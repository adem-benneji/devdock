package com.devtools.tools.features.sqlformatter;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import com.github.vertical_blank.sqlformatter.SqlFormatter;
import com.github.vertical_blank.sqlformatter.languages.Dialect;
import java.util.Map;

/** Backend implementation of the sql-formatter tool. */
public final class SqlFormatterTool implements ToolProcessor {
  @Override
  public String id() {
    return "sql-formatter";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return SqlFormatter.of(
            switch (mode) {
              case "postgresql" -> Dialect.PostgreSql;
              case "mysql" -> Dialect.MySql;
              case "tsql" -> Dialect.TSql;
              default -> Dialect.StandardSql;
            })
        .format(
            input,
            com.github.vertical_blank.sqlformatter.core.FormatConfig.builder()
                .uppercase(true)
                .build());
  }
}
