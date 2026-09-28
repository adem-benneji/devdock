package com.devtools.tools.features.regextester;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;
import java.util.regex.*;

/** Backend implementation of the regex-tester tool. */
public final class RegexTesterTool implements ToolProcessor {
  @Override
  public String id() {
    return "regex-tester";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return regex(input, mode, fields);
  }

  static String regex(String input, String mode, Map<String, String> fields) {
    String source = fields.getOrDefault("pattern", ""),
        flags = fields.getOrDefault("flags", ""),
        replacement = fields.getOrDefault("replacement", "");
    if (source.length() > 1000
        || replacement.length() > 2000
        || !flags.matches("[gimsuy]*")
        || flags.chars().distinct().count() != flags.length())
      throw invalid(
          "Use at most 1,000 pattern characters, 2,000 replacement characters, and unique gimsuy"
              + " flags.");
    int options = 0;
    if (flags.contains("i")) options |= Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE;
    if (flags.contains("m")) options |= Pattern.MULTILINE;
    if (flags.contains("s")) options |= Pattern.DOTALL;
    Matcher matcher;
    try {
      matcher = Pattern.compile(source, options).matcher(input);
    } catch (PatternSyntaxException e) {
      throw invalid("Invalid Java regular expression. Enter the pattern without / delimiters.");
    }
    var matches = JSON.createArrayNode();
    var result = new StringBuilder();
    int end = 0;
    while (matcher.find()) {
      if (flags.contains("y") && matcher.start() != end) break;
      if (matches.size() >= 500) throw invalid("More than 500 matches. Narrow the pattern.");
      var match =
          matches
              .addObject()
              .put("text", matcher.group())
              .put("index", matcher.start())
              .put("end", matcher.end());
      var groups = match.putArray("groups");
      for (int g = 1; g <= matcher.groupCount(); g++) groups.add(matcher.group(g));
      var named = match.putObject("namedGroups");
      matcher.namedGroups().forEach((name, index) -> named.put(name, matcher.group(index)));
      if (mode.equals("replace")) {
        result.append(input, end, matcher.start()).append(replacement(replacement, matcher, input));
        if (result.length() > 1_000_000) throw invalid("Result exceeds 1,000,000 characters.");
      }
      end = matcher.end();
      if (!flags.contains("g")) break;
    }
    if (mode.equals("replace")) return result.append(input.substring(end)).toString();
    return json(Map.of("count", matches.size(), "matches", matches));
  }

  static String replacement(String template, Matcher match, String input) {
    var result = new StringBuilder();
    for (int i = 0; i < template.length(); i++) {
      char c = template.charAt(i);
      if (c != '$' || i + 1 == template.length()) {
        result.append(c);
        continue;
      }
      char next = template.charAt(i + 1);
      if (next == '$') {
        result.append('$');
        i++;
      } else if (next == '&') {
        result.append(match.group());
        i++;
      } else if (next == '`') {
        result.append(input, 0, match.start());
        i++;
      } else if (next == '\'') {
        result.append(input.substring(match.end()));
        i++;
      } else if (next >= '1' && next <= '9') {
        int group = next - '0';
        if (i + 2 < template.length()
            && Character.isDigit(template.charAt(i + 2))
            && group * 10 + (template.charAt(i + 2) - '0') <= match.groupCount()) {
          group = group * 10 + (template.charAt(i + 2) - '0');
          i++;
        }
        if (group <= match.groupCount()) {
          String v = match.group(group);
          result.append(v == null ? "" : v);
          i++;
        } else result.append('$');
      } else if (next == '<') {
        int close = template.indexOf('>', i + 2);
        String name = close < 0 ? "" : template.substring(i + 2, close);
        if (match.namedGroups().containsKey(name)) {
          String value = match.group(name);
          result.append(value == null ? "" : value);
          i = close;
        } else result.append('$');
      } else result.append('$');
    }
    return result.toString();
  }
}
