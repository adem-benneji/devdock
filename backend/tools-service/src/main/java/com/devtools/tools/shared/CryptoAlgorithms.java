package com.devtools.tools.shared;

import static com.devtools.tools.utilities.UtilitySupport.invalid;

public final class CryptoAlgorithms {
  public static String algorithm(String mode) {
    return switch (mode) {
      case "sha256" -> "SHA-256";
      case "sha384" -> "SHA-384";
      case "sha512" -> "SHA-512";
      default -> throw invalid("Choose SHA-256, SHA-384, or SHA-512.");
    };
  }
}
