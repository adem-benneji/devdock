package com.devtools.tools.features.jsonformatter;

import com.devtools.tools.ApiException;
import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import java.io.IOException;
import java.io.StringWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class JsonTool {
  public enum Mode {
    FORMAT,
    MINIFY
  }

  private final JsonFactory factory =
      JsonFactory.builder()
          .enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION)
          .streamReadConstraints(
              StreamReadConstraints.builder()
                  .maxNestingDepth(100)
                  .maxNumberLength(1000)
                  .maxStringLength(100_000)
                  .build())
          .build();

  public String transform(String input, Mode mode) {
    // Stream tokens instead of coercing numbers through double or a JSON tree.
    try (JsonParser parser = factory.createParser(input);
        StringWriter output = new BoundedOutput();
        JsonGenerator writer = factory.createGenerator(output)) {
      if (mode == Mode.FORMAT) {
        var printer = new DefaultPrettyPrinter();
        var indenter = new DefaultIndenter("  ", "\n");
        printer.indentObjectsWith(indenter);
        printer.indentArraysWith(indenter);
        writer.setPrettyPrinter(printer);
      }
      if (parser.nextToken() == null) throw invalid();
      int depth = 0;
      do {
        JsonToken token = parser.currentToken();
        if (token.isStructStart()) depth++;
        if (token.isStructEnd()) depth--;
        if (token.isNumeric()) writer.writeNumber(parser.getText());
        else writer.copyCurrentEvent(parser);
        if (depth == 0) break;
      } while (parser.nextToken() != null);
      if (depth != 0 || parser.nextToken() != null) throw invalid();
      writer.flush();
      return output.toString();
    } catch (JsonProcessingException ex) {
      // Never echo input or parser excerpts, which may contain secrets.
      var location = ex.getLocation();
      String position =
          location == null
              ? ""
              : " at line " + location.getLineNr() + ", column " + location.getColumnNr();
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_JSON",
          "Invalid JSON"
              + position
              + ". Use one value, unique object keys, and at most 100 nesting levels.");
    } catch (IOException ex) {
      throw new IllegalStateException("JSON processing failed", ex);
    }
  }

  private ApiException invalid() {
    return new ApiException(
        HttpStatus.BAD_REQUEST, "INVALID_JSON", "Provide exactly one complete JSON value.");
  }

  private static final class BoundedOutput extends StringWriter {
    @Override
    public void write(char[] chars, int offset, int length) {
      check(length);
      super.write(chars, offset, length);
    }

    @Override
    public void write(String text, int offset, int length) {
      check(length);
      super.write(text, offset, length);
    }

    @Override
    public void write(int character) {
      check(1);
      super.write(character);
    }

    private void check(int additionalLength) {
      if (getBuffer().length() + additionalLength > 1_000_000)
        throw new ApiException(
            HttpStatus.BAD_REQUEST,
            "OUTPUT_TOO_LARGE",
            "Formatted output exceeds 1,000,000 characters. Minify or use a smaller document.");
    }
  }
}
