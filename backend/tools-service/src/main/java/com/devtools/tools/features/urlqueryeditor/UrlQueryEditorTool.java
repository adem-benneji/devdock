package com.devtools.tools.features.urlqueryeditor;

import static com.devtools.tools.shared.UrlSupport.*;
import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Backend implementation of the url-query-editor tool. */
public final class UrlQueryEditorTool implements ToolProcessor {
  @Override
  public String id() {
    return "url-query-editor";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return editUrl(input, mode, fields.getOrDefault("changes", ""));
  }

  static String editUrl(String input, String mode, String changes) {
    URI u = uri(input);
    if (u.getRawUserInfo() != null)
      throw invalid("Remove embedded credentials before editing this URL.");
    var pairs = query(u);
    if (mode.equals("clean"))
      pairs.removeIf(p -> p.get("name").matches("(?i)(utm_.*|gclid|dclid|fbclid|msclkid|igshid)"));
    else {
      var edits = parse(changes);
      if (!edits.isObject())
        throw invalid("Parameter edits must be an object of strings, string arrays, or null.");
      edits
          .fields()
          .forEachRemaining(
              e -> {
                var value = e.getValue();
                if (!value.isNull()
                    && !value.isTextual()
                    && !(value.isArray()
                        && java.util.stream.StreamSupport.stream(value.spliterator(), false)
                            .allMatch(v -> v.isTextual())))
                  throw invalid("Parameter values must be strings, string arrays, or null.");
                pairs.removeIf(p -> p.get("name").equals(e.getKey()));
                if (value.isTextual())
                  pairs.add(Map.of("name", e.getKey(), "value", value.textValue()));
                else if (value.isArray())
                  value.forEach(v -> pairs.add(Map.of("name", e.getKey(), "value", v.textValue())));
              });
    }
    String query =
        String.join(
            "&",
            pairs.stream()
                .map(
                    p ->
                        URLEncoder.encode(p.get("name"), StandardCharsets.UTF_8)
                            + "="
                            + URLEncoder.encode(p.get("value"), StandardCharsets.UTF_8))
                .toList());
    return u.getScheme()
        + "://"
        + u.getRawAuthority()
        + (u.getRawPath().isEmpty() ? "/" : u.getRawPath())
        + (query.isEmpty() ? "" : "?" + query)
        + (u.getRawFragment() == null ? "" : "#" + u.getRawFragment());
  }
}
