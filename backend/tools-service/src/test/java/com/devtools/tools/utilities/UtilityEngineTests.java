package com.devtools.tools.utilities;

import static org.junit.jupiter.api.Assertions.*;

import com.devtools.tools.ApiException;
import java.util.Map;
import org.junit.jupiter.api.Test;

class UtilityEngineTests {
  @Test
  void rejectsUnknownModesAndFieldsBeforeExecution() {
    assertThrows(
        ApiException.class,
        () -> UtilityEngine.execute("base64", new UtilityEngine.Request("x", "wrong", Map.of())));
    assertThrows(
        ApiException.class,
        () ->
            UtilityEngine.execute(
                "base64", new UtilityEngine.Request("x", "encode", Map.of("command", "x"))));
  }

  @Test
  void utf8Base64RoundTripAndCanonicalValidation() {
    String input = "Hello 👋 café";
    String encoded =
        UtilityEngine.execute("base64", new UtilityEngine.Request(input, "encode", Map.of()))
            .output();
    assertEquals(
        input,
        UtilityEngine.execute("base64", new UtilityEngine.Request(encoded, "decode", Map.of()))
            .output());
    assertThrows(
        ApiException.class,
        () ->
            UtilityEngine.execute("base64", new UtilityEngine.Request("/w==", "decode", Map.of())));
  }

  @Test
  void schemaNeverFetchesRemoteReferences() {
    assertThrows(
        ApiException.class,
        () ->
            UtilityEngine.execute(
                "json-schema-validator",
                new UtilityEngine.Request(
                    "{}", "draft7", Map.of("schema", "{\"$ref\":\"http://127.0.0.1/private\"}"))));
  }
}
