package com.devtools.tools.features.unixtimestamp;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.*;
import java.util.Map;

/** Backend implementation of the unix-timestamp tool. */
public final class UnixTimestampTool implements ToolProcessor {
  @Override
  public String id() {
    return "unix-timestamp";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return timestamp(input, mode);
  }

  static String timestamp(String input, String mode) {
    String value = input.strip();
    try {
      if (mode.equals("iso")) {
        if (!value.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,3})?Z"))
          throw invalid("Enter a UTC ISO date ending in Z.");
        var date =
            OffsetDateTime.parse(
                value,
                DateTimeFormatter.ISO_OFFSET_DATE_TIME.withResolverStyle(ResolverStyle.STRICT));
        return BigDecimal.valueOf(date.toInstant().toEpochMilli(), 3)
            .stripTrailingZeros()
            .toPlainString();
      }
      if (!value.matches(mode.equals("seconds") ? "-?\\d+(?:\\.\\d{1,3})?" : "-?\\d+"))
        throw invalid("Enter a numeric timestamp in the selected unit.");
      long millis =
          new BigDecimal(value)
              .multiply(BigDecimal.valueOf(mode.equals("seconds") ? 1000 : 1))
              .longValueExact();
      if (Math.abs((double) millis) > 8.64e15)
        throw invalid("Timestamp is outside the supported range.");
      return new DateTimeFormatterBuilder()
          .appendInstant(3)
          .toFormatter()
          .format(Instant.ofEpochMilli(millis));
    } catch (DateTimeException | ArithmeticException | NumberFormatException e) {
      throw invalid("Enter a valid date or timestamp in the selected unit.");
    }
  }
}
