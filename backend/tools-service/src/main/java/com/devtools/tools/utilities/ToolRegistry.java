package com.devtools.tools.utilities;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class ToolRegistry {
  private ToolRegistry() {}

  public static final Map<String, ToolProcessor> TOOLS =
      List.<ToolProcessor>of(
              new com.devtools.tools.features.base64.Base64Tool(),
              new com.devtools.tools.features.caseconverter.CaseConverterTool(),
              new com.devtools.tools.features.linetoolkit.LineToolkitTool(),
              new com.devtools.tools.features.numberbaseconverter.NumberBaseConverterTool(),
              new com.devtools.tools.features.unixtimestamp.UnixTimestampTool(),
              new com.devtools.tools.features.wordcounter.WordCounterTool(),
              new com.devtools.tools.features.texthex.TextHexTool(),
              new com.devtools.tools.features.jsonstring.JsonStringTool(),
              new com.devtools.tools.features.unicodeinspector.UnicodeInspectorTool(),
              new com.devtools.tools.features.lineendings.LineEndingsTool(),
              new com.devtools.tools.features.sluggenerator.SlugGeneratorTool(),
              new com.devtools.tools.features.htmlentities.HtmlEntitiesTool(),
              new com.devtools.tools.features.hashgenerator.HashGeneratorTool(),
              new com.devtools.tools.features.uuidgenerator.UuidGeneratorTool(),
              new com.devtools.tools.features.passwordgenerator.PasswordGeneratorTool(),
              new com.devtools.tools.features.hmacsigner.HmacSignerTool(),
              new com.devtools.tools.features.pkcegenerator.PkceGeneratorTool(),
              new com.devtools.tools.features.jwtdecoder.JwtDecoderTool(),
              new com.devtools.tools.features.urlcodec.UrlCodecTool(),
              new com.devtools.tools.features.urlparser.UrlParserTool(),
              new com.devtools.tools.features.urlqueryeditor.UrlQueryEditorTool(),
              new com.devtools.tools.features.ipv4cidr.Ipv4CidrTool(),
              new com.devtools.tools.features.gzipdeflate.GzipDeflateTool(),
              new com.devtools.tools.features.csvjson.CsvJsonTool(),
              new com.devtools.tools.features.yamljson.YamlJsonTool(),
              new com.devtools.tools.features.markdowntable.MarkdownTableTool(),
              new com.devtools.tools.features.jsontotypescript.JsonToTypescriptTool(),
              new com.devtools.tools.features.jsonschemagenerator.JsonSchemaGeneratorTool(),
              new com.devtools.tools.features.jsonlines.JsonLinesTool(),
              new com.devtools.tools.features.jsonflatten.JsonFlattenTool(),
              new com.devtools.tools.features.jsondiff.JsonDiffTool(),
              new com.devtools.tools.features.jsonpathtester.JsonpathTesterTool(),
              new com.devtools.tools.features.regextester.RegexTesterTool(),
              new com.devtools.tools.features.textdiff.TextDiffTool(),
              new com.devtools.tools.features.semvertool.SemverTool(),
              new com.devtools.tools.features.jsonschemavalidator.JsonSchemaValidatorTool(),
              new com.devtools.tools.features.sqlformatter.SqlFormatterTool())
          .stream()
          .collect(Collectors.toUnmodifiableMap(ToolProcessor::id, Function.identity()));
}
