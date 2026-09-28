package com.devtools.tools.features.hashgenerator;

import static com.devtools.tools.shared.CryptoAlgorithms.algorithm;
import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.security.MessageDigest;
import java.util.*;

/** Backend implementation of the hash-generator tool. */
public final class HashGeneratorTool implements ToolProcessor {
  @Override
  public String id() {
    return "hash-generator";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return HexFormat.of().formatHex(MessageDigest.getInstance(algorithm(mode)).digest(utf(input)));
  }
}
