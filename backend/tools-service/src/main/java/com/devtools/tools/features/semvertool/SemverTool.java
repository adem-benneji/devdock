package com.devtools.tools.features.semvertool;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;
import org.semver4j.Semver;
import org.semver4j.range.RangeListFactory;

/** Backend implementation of the semver-tool tool. */
public final class SemverTool implements ToolProcessor {
  @Override
  public String id() {
    return "semver-tool";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return semver(input, mode, fields.getOrDefault("reference", ""));
  }

  static Semver version(String input) {
    if (input.length() > 256 || !input.strip().matches("\\d+\\.\\d+\\.\\d+(?:[-+].*)?"))
      throw invalid("Enter a strict semantic version, such as 1.2.3-beta.1+build.7.");
    try {
      return new Semver(input.strip());
    } catch (IllegalArgumentException e) {
      throw invalid("Enter a strict semantic version.");
    }
  }

  static String semver(String input, String mode, String reference) {
    Semver v = version(input);
    if (mode.equals("inspect"))
      return json(
          Map.of(
              "version",
              input.strip(),
              "major",
              v.getMajor(),
              "minor",
              v.getMinor(),
              "patch",
              v.getPatch(),
              "prerelease",
              v.getPreRelease().stream()
                  .map(p -> p.matches("[0-9]+") ? (Object) new java.math.BigInteger(p) : p)
                  .toList(),
              "build",
              v.getBuild()));
    if (Set.of("major", "minor", "patch").contains(mode)) {
      try {
        return switch (mode) {
          case "major" ->
              (v.getMinor() == 0 && v.getPatch() == 0 && !v.getPreRelease().isEmpty()
                      ? v.withClearedPreReleaseAndBuild()
                      : v.nextMajor())
                  .getVersion();
          case "minor" ->
              (v.getPatch() == 0 && !v.getPreRelease().isEmpty()
                      ? v.withClearedPreReleaseAndBuild()
                      : v.nextMinor())
                  .getVersion();
          default ->
              (!v.getPreRelease().isEmpty() ? v.withClearedPreReleaseAndBuild() : v.nextPatch())
                  .getVersion();
        };
      } catch (Exception e) {
        throw invalid("The incremented version exceeds the supported numeric range.");
      }
    }
    if (reference.isBlank() || reference.length() > 1000)
      throw invalid("Enter a comparison version or range of up to 1,000 characters.");
    if (mode.equals("compare")) {
      int c = v.compareTo(version(reference));
      return json(
          Map.of(
              "version",
              input.strip(),
              "other",
              reference.strip(),
              "precedence",
              c < 0 ? "lower" : c > 0 ? "higher" : "equal",
              "buildMetadataIgnored",
              true));
    }
    try {
      var range = RangeListFactory.create(reference);
      return json(
          Map.of(
              "version",
              input.strip(),
              "range",
              reference,
              "normalizedRange",
              range.toString(),
              "satisfies",
              v.satisfies(reference)));
    } catch (Exception e) {
      throw invalid("Enter a valid npm-compatible semantic-version range.");
    }
  }
}
