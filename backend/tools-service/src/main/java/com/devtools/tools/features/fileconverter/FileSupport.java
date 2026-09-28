package com.devtools.tools.features.fileconverter;

import com.devtools.tools.ApiException;
import java.io.*;
import java.nio.*;
import java.nio.charset.*;
import java.util.*;
import org.springframework.http.HttpStatus;

final class FileSupport {
  static final int INPUT_LIMIT = 5_000_000, OUTPUT_LIMIT = 20_000_000, TEXT_LIMIT = 500_000;

  static ApiException invalid(String message) {
    return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_FILE", message);
  }

  static ApiException unsupported(String message) {
    return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "UNSUPPORTED_CONVERSION", message);
  }

  static byte[] read(InputStream input, int limit) throws IOException {
    byte[] bytes = input.readNBytes(limit + 1);
    if (bytes.length > limit)
      throw new ApiException(
          HttpStatus.PAYLOAD_TOO_LARGE,
          "FILE_TOO_LARGE",
          "This file or its expanded content exceeds the supported size limit.");
    return bytes;
  }

  static String text(byte[] bytes) {
    if (bytes.length > TEXT_LIMIT) throw invalid("Text files must be at most 500 KB.");
    try {
      String value =
          StandardCharsets.UTF_8
              .newDecoder()
              .onMalformedInput(CodingErrorAction.REPORT)
              .onUnmappableCharacter(CodingErrorAction.REPORT)
              .decode(ByteBuffer.wrap(bytes))
              .toString()
              .replaceFirst("^\\uFEFF", "");
      if (value.codePoints().anyMatch(c -> c < 32 && c != 9 && c != 10 && c != 13))
        throw invalid("We could not identify this file as supported UTF-8 text.");
      return value;
    } catch (CharacterCodingException ex) {
      throw invalid("We could not identify this file. Text files must use UTF-8.");
    }
  }

  static String extension(String name) {
    String lower = name.toLowerCase(Locale.ROOT);
    if (lower.endsWith(".tar.gz")) return "tgz";
    if (lower.endsWith(".tar.bz2")) return "tbz2";
    if (lower.endsWith(".tar.xz")) return "txz";
    int dot = lower.lastIndexOf('.');
    String ext = dot < 0 ? "" : lower.substring(dot + 1);
    return switch (ext) {
      case "tbz" -> "tbz2";
      case "jpeg" -> "jpg";
      case "tif" -> "tiff";
      case "yml" -> "yaml";
      case "markdown" -> "md";
      case "htm" -> "html";
      default -> ext;
    };
  }

  static String filename(String input, String extension) {
    String base = input.replace('\\', '/');
    base = base.substring(base.lastIndexOf('/') + 1);
    base =
        base.replaceFirst("(?i)(\\.tar\\.(?:gz|bz2|xz)|\\.[^.]*)$", "")
            .replaceAll("[^A-Za-z0-9._ -]", "_")
            .replaceAll("^\\.+", "");
    if (base.isBlank()) base = "converted";
    return base.substring(0, Math.min(base.length(), 100)) + "." + extension;
  }

  static boolean prefix(byte[] bytes, int... signature) {
    if (bytes.length < signature.length) return false;
    for (int i = 0; i < signature.length; i++) if ((bytes[i] & 255) != signature[i]) return false;
    return true;
  }

  static final class Output extends ByteArrayOutputStream {
    private void check(int size) {
      if ((long) count + size > OUTPUT_LIMIT)
        throw invalid("The converted file exceeds the 20 MB output limit.");
    }

    @Override
    public synchronized void write(int b) {
      check(1);
      super.write(b);
    }

    @Override
    public synchronized void write(byte[] b, int off, int len) {
      check(len);
      super.write(b, off, len);
    }
  }
}
