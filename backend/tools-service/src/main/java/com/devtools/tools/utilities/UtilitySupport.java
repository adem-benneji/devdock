package com.devtools.tools.utilities;

import com.devtools.tools.ApiException;
import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;
import java.io.*;
import java.nio.*;
import java.nio.charset.*;
import java.util.*;
import org.springframework.http.HttpStatus;

public final class UtilitySupport {
  public static final ObjectMapper JSON =
      new ObjectMapper()
          .enable(
              DeserializationFeature.FAIL_ON_TRAILING_TOKENS,
              DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS,
              DeserializationFeature.USE_BIG_INTEGER_FOR_INTS)
          .enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);

  static {
    JSON.getFactory()
        .setStreamReadConstraints(
            StreamReadConstraints.builder()
                .maxNestingDepth(64)
                .maxStringLength(100_000)
                .maxNumberLength(4096)
                .build());
  }

  private static final com.fasterxml.jackson.core.util.DefaultPrettyPrinter PRETTY =
      new com.fasterxml.jackson.core.util.DefaultPrettyPrinter() {
        @Override
        public com.fasterxml.jackson.core.util.DefaultPrettyPrinter createInstance() {
          return new com.fasterxml.jackson.core.util.DefaultPrettyPrinter(this) {
            @Override
            public void writeObjectFieldValueSeparator(JsonGenerator generator) throws IOException {
              generator.writeRaw(": ");
            }
          };
        }

        @Override
        public void writeObjectFieldValueSeparator(JsonGenerator generator) throws IOException {
          generator.writeRaw(": ");
        }
      };

  private UtilitySupport() {}

  public static ApiException invalid(String message) {
    return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOOL_INPUT", message);
  }

  public static JsonNode parse(String value) {
    try {
      var node = JSON.readTree(value);
      if (node == null) throw invalid("Enter one complete JSON value.");
      return node;
    } catch (IOException e) {
      throw invalid(
          "Enter valid JSON without duplicate keys, comments, trailing values, or excessive"
              + " nesting.");
    }
  }

  public static String json(Object value) {
    try {
      return bounded(JSON.writer(PRETTY).writeValueAsString(value));
    } catch (IOException e) {
      throw invalid("The result could not be serialized.");
    }
  }

  public static String compact(Object value) {
    try {
      return bounded(JSON.writeValueAsString(value));
    } catch (IOException e) {
      throw invalid("The result could not be serialized.");
    }
  }

  public static String bounded(String value) {
    if (value.length() > 1_000_000)
      throw invalid("Result exceeds 1,000,000 characters. Use smaller input.");
    return value;
  }

  public static byte[] utf(String value) {
    try {
      var b =
          StandardCharsets.UTF_8
              .newEncoder()
              .onMalformedInput(CodingErrorAction.REPORT)
              .encode(CharBuffer.wrap(value));
      byte[] out = new byte[b.remaining()];
      b.get(out);
      return out;
    } catch (CharacterCodingException e) {
      throw invalid("Use well-formed Unicode without unpaired surrogates.");
    }
  }

  public static String text(byte[] bytes) {
    try {
      return StandardCharsets.UTF_8
          .newDecoder()
          .onMalformedInput(CodingErrorAction.REPORT)
          .decode(ByteBuffer.wrap(bytes))
          .toString();
    } catch (CharacterCodingException e) {
      throw invalid("These bytes are not valid UTF-8 text.");
    }
  }

  public static byte[] base64(String input) {
    try {
      String value = input.replaceAll("\\s", "");
      byte[] bytes = Base64.getDecoder().decode(value);
      if (!Base64.getEncoder().encodeToString(bytes).equals(value))
        throw invalid("Enter valid, padded Base64.");
      return bytes;
    } catch (IllegalArgumentException e) {
      throw invalid("Enter valid, padded Base64.");
    }
  }

  public static int integer(String input, int min, int max) {
    try {
      if (!input.strip().matches("[0-9]+")) throw invalid("Enter a whole number.");
      int n = Integer.parseInt(input.strip());
      if (n < min || n > max)
        throw invalid("Choose a whole number between " + min + " and " + max + ".");
      return n;
    } catch (NumberFormatException e) {
      throw invalid("Choose a whole number between " + min + " and " + max + ".");
    }
  }
}
