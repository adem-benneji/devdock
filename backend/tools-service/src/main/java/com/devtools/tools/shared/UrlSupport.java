package com.devtools.tools.shared;

import static com.devtools.tools.utilities.UtilitySupport.*;

import java.io.ByteArrayOutputStream;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public final class UrlSupport {
  public static URI uri(String input) {
    try {
      URI u = new URI(input.strip());
      if (!Set.of("http", "https").contains(u.getScheme()) || u.getHost() == null)
        throw invalid("Enter an absolute HTTP or HTTPS URL.");
      if (u.getPort() > 65535) throw invalid("The URL port exceeds 65535.");
      return u;
    } catch (URISyntaxException e) {
      throw invalid("Enter a valid HTTP or HTTPS URL.");
    }
  }

  public static List<Map<String, String>> query(URI uri) {
    var pairs = new ArrayList<Map<String, String>>();
    if (uri.getRawQuery() != null && !uri.getRawQuery().isEmpty())
      for (String pair : uri.getRawQuery().split("&")) {
        if (pair.isEmpty()) continue;
        String[] parts = pair.split("=", 2);
        pairs.add(
            Map.of(
                "name",
                decodeComponent(parts[0].replace("+", " ")),
                "value",
                parts.length == 2 ? decodeComponent(parts[1].replace("+", " ")) : ""));
      }
    return pairs;
  }

  public static String encodeComponent(String input) {
    return URLEncoder.encode(text(utf(input)), StandardCharsets.UTF_8)
        .replace("+", "%20")
        .replace("%21", "!")
        .replace("%27", "'")
        .replace("%28", "(")
        .replace("%29", ")")
        .replace("%7E", "~");
  }

  public static String decodeComponent(String input) {
    try {
      var out = new ByteArrayOutputStream();
      for (int i = 0; i < input.length(); ) {
        if (input.charAt(i) == '%') {
          if (i + 2 >= input.length()) throw invalid("Enter complete percent escapes.");
          out.write(Integer.parseInt(input.substring(i + 1, i + 3), 16));
          i += 3;
        } else {
          int c = input.codePointAt(i);
          out.writeBytes(utf(new String(Character.toChars(c))));
          i += Character.charCount(c);
        }
      }
      return text(out.toByteArray());
    } catch (IllegalArgumentException e) {
      throw invalid("The URL component contains invalid escaping.");
    }
  }
}
