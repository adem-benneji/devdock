package com.devtools.tools.features.gzipdeflate;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.io.*;
import java.util.*;
import java.util.zip.*;

/** Backend implementation of the gzip-deflate tool. */
public final class GzipDeflateTool implements ToolProcessor {
  @Override
  public String id() {
    return "gzip-deflate";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return compression(input, mode);
  }

  static String compression(String input, String mode) throws IOException {
    boolean gzip = mode.endsWith("gzip");
    if (mode.startsWith("compress-")) {
      var out = new ByteArrayOutputStream();
      try (OutputStream compressor =
          gzip ? new GZIPOutputStream(out) : new DeflaterOutputStream(out)) {
        compressor.write(utf(input));
      }
      return Base64.getEncoder().encodeToString(out.toByteArray());
    }
    try (InputStream decompressor =
        gzip
            ? new GZIPInputStream(new ByteArrayInputStream(base64(input)))
            : new InflaterInputStream(new ByteArrayInputStream(base64(input)))) {
      byte[] expanded = decompressor.readNBytes(1_000_001);
      if (expanded.length > 1_000_000) throw invalid("Expanded result exceeds 1,000,000 bytes.");
      return text(expanded);
    } catch (IOException e) {
      throw invalid("Invalid or truncated compressed data, or the selected format does not match.");
    }
  }
}
