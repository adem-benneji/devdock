package com.devtools.tools.features.hmacsigner;

import static com.devtools.tools.shared.CryptoAlgorithms.algorithm;
import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.security.*;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** Backend implementation of the hmac-signer tool. */
public final class HmacSignerTool implements ToolProcessor {
  @Override
  public String id() {
    return "hmac-signer";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return hmac(input, mode, fields);
  }

  static String hmac(String input, String mode, Map<String, String> fields)
      throws GeneralSecurityException {
    String secret = fields.getOrDefault("secret", "");
    if (secret.isEmpty() || secret.length() > 4096)
      throw invalid("Enter a UTF-8 secret of 1–4,096 characters.");
    boolean verify = mode.startsWith("verify-");
    String hash = algorithm(mode.replaceFirst("^verify-", ""));
    String name = "Hmac" + hash.replace("-", "");
    Mac mac = Mac.getInstance(name);
    mac.init(new SecretKeySpec(utf(secret), name));
    byte[] signature = mac.doFinal(utf(input));
    if (!verify) return HexFormat.of().formatHex(signature);
    String hex = fields.getOrDefault("signature", "").strip();
    if (hex.length() != signature.length * 2 || !hex.matches("[a-fA-F0-9]+"))
      throw invalid("Enter a " + signature.length * 2 + "-character hexadecimal signature.");
    return json(
        Map.of(
            "algorithm",
            "HMAC-" + hash,
            "matches",
            MessageDigest.isEqual(signature, HexFormat.of().parseHex(hex))));
  }
}
