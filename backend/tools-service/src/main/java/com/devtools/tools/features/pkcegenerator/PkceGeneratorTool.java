package com.devtools.tools.features.pkcegenerator;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.security.*;
import java.util.*;

/** Backend implementation of the pkce-generator tool. */
public final class PkceGeneratorTool implements ToolProcessor {
  @Override
  public String id() {
    return "pkce-generator";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    byte[] random = new byte[32];
    RANDOM.nextBytes(random);
    String verifier =
        mode.equals("generate")
            ? Base64.getUrlEncoder().withoutPadding().encodeToString(random)
            : input;
    if (!verifier.matches("[A-Za-z0-9._~-]{43,128}"))
      throw invalid("A PKCE verifier must contain 43–128 URL-safe ASCII characters.");
    return json(
        Map.of(
            "codeVerifier",
            verifier,
            "codeChallenge",
            Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(MessageDigest.getInstance("SHA-256").digest(utf(verifier))),
            "codeChallengeMethod",
            "S256"));
  }

  private static final SecureRandom RANDOM = new SecureRandom();
}
