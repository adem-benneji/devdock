package com.devtools.tools.features.urlparser;

import static com.devtools.tools.shared.UrlSupport.*;
import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.net.URI;
import java.util.*;

/** Backend implementation of the url-parser tool. */
public final class UrlParserTool implements ToolProcessor {
  @Override
  public String id() {
    return "url-parser";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return parseUrl(input);
  }

  static String parseUrl(String input) {
    URI u = uri(input);
    String protocol = u.getScheme(), host = u.getHost().toLowerCase(Locale.ROOT);
    int port = u.getPort() < 0 ? (protocol.equals("https") ? 443 : 80) : u.getPort();
    String origin =
        protocol
            + "://"
            + host
            + ((protocol.equals("https") && port == 443 || protocol.equals("http") && port == 80)
                ? ""
                : ":" + port);
    return json(
        Map.of(
            "protocol",
            protocol,
            "origin",
            origin,
            "hostname",
            host,
            "port",
            String.valueOf(port),
            "pathname",
            u.getRawPath().isEmpty() ? "/" : u.getRawPath(),
            "query",
            query(u),
            "fragment",
            u.getRawFragment() == null ? "" : u.getRawFragment(),
            "credentialsPresent",
            u.getRawUserInfo() != null));
  }
}
