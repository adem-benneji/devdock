package com.devtools.tools.features.jwtdecoder;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

/** Backend implementation of the jwt-decoder tool. */
public final class JwtDecoderTool implements ToolProcessor {
  @Override
  public String id() {
    return "jwt-decoder";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return jwt(input);
  }

  static String jwt(String input) {
    String[] parts = input.strip().replaceFirst("(?i)^Bearer\\s+", "").split("\\.", -1);
    if (parts.length != 3 || !parts[2].matches("[A-Za-z0-9_-]*") || parts[2].length() % 4 == 1)
      throw invalid("Enter a three-part JWT: header.payload.signature.");
    var header = segment(parts[0]);
    var claims = segment(parts[1]);
    Map<String, Object> expiration = Map.of("status", "not provided");
    if (claims.has("exp")) {
      try {
        if (!claims.get("exp").isNumber()) throw new ArithmeticException();
        var instant =
            Instant.ofEpochMilli(
                claims
                    .get("exp")
                    .decimalValue()
                    .multiply(java.math.BigDecimal.valueOf(1000))
                    .longValueExact());
        var now = Instant.now();
        expiration =
            Map.of(
                "status",
                now.compareTo(instant) >= 0 ? "expired" : "not expired",
                "expiresAt",
                instant.toString(),
                "evaluatedAt",
                now.toString());
      } catch (Exception e) {
        expiration = Map.of("status", "invalid exp claim; expected Unix seconds");
      }
    }
    return json(
        Map.of(
            "signatureVerified",
            false,
            "warning",
            "Decoded only. Claims and expiration are untrusted; signature, issuer, audience, and"
                + " not-before are not validated.",
            "header",
            header,
            "claims",
            claims,
            "signaturePresent",
            !parts[2].isEmpty(),
            "expiration",
            expiration));
  }

  static com.fasterxml.jackson.databind.JsonNode segment(String encoded) {
    if (!encoded.matches("[A-Za-z0-9_-]+") || encoded.length() % 4 == 1)
      throw invalid("JWT segments must use unpadded Base64url.");
    try {
      byte[] bytes = Base64.getUrlDecoder().decode(encoded);
      if (!Base64.getUrlEncoder().withoutPadding().encodeToString(bytes).equals(encoded))
        throw invalid("JWT contains non-canonical Base64url.");
      var value = parse(text(bytes));
      if (!value.isObject()) throw invalid("JWT header and claims must be JSON objects.");
      return value;
    } catch (IllegalArgumentException e) {
      throw invalid("Enter valid JWT Base64url segments.");
    }
  }
}
