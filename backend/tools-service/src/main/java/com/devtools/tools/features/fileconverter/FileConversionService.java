package com.devtools.tools.features.fileconverter;

import com.devtools.tools.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.Semaphore;
import java.util.function.Supplier;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class FileConversionService {
  @io.swagger.v3.oas.annotations.media.Schema(
      requiredProperties = {"id", "label", "extension", "mime", "kind", "note"})
  public record Choice(
      String id, String label, String extension, String mime, String kind, String note) {}

  @io.swagger.v3.oas.annotations.media.Schema(
      requiredProperties = {"id", "name", "sources", "status"})
  public record Section(String id, String name, List<String> sources, String status) {}

  @io.swagger.v3.oas.annotations.media.Schema(
      requiredProperties = {"maxInputBytes", "maxOutputBytes", "sections"})
  public record Capabilities(int maxInputBytes, int maxOutputBytes, List<Section> sections) {}

  @io.swagger.v3.oas.annotations.media.Schema(
      requiredProperties = {
        "filename",
        "size",
        "format",
        "category",
        "details",
        "warnings",
        "outputs"
      })
  public record Inspection(
      String filename,
      long size,
      String format,
      String category,
      Map<String, Object> details,
      List<String> warnings,
      List<Choice> outputs) {}

  public record Converted(byte[] bytes, String filename, String mime) {}

  record Source(
      String format,
      String category,
      Object value,
      Map<String, Object> details,
      List<String> warnings) {}

  private final Semaphore slots = new Semaphore(2);
  private static final Set<String> DATA =
      Set.of("json", "yaml", "toml", "csv", "tsv", "env", "ini", "xml");
  private static final Set<String> IMAGES = Set.of("png", "jpg", "gif", "bmp", "tiff", "webp");
  private static final Map<String, Choice> OUTPUTS = new LinkedHashMap<>();

  static {
    choice(
        "json",
        "JSON",
        "json",
        "application/json",
        "convert",
        "Readable data; table cells remain strings.");
    choice(
        "yaml",
        "YAML",
        "yaml",
        "application/yaml",
        "convert",
        "Formatting and comments are regenerated.");
    choice(
        "toml",
        "TOML",
        "toml",
        "application/toml",
        "convert",
        "Available only when this data can be represented in TOML.");
    choice(
        "xml",
        "XML data",
        "xml",
        "application/xml",
        "convert",
        "One named root; @keys become attributes, #text is leaf text, arrays repeat child elements."
            + " Scalars become text; comments and formatting are not retained.");
    choice(
        "env",
        "ENV configuration",
        "env",
        "text/plain",
        "convert",
        "Flat string assignments only. Values are literal: variables and escapes are not expanded."
            + " This is a configuration file, not a shell script.");
    choice(
        "ini",
        "INI configuration",
        "ini",
        "text/plain",
        "convert",
        "String assignments and one level of named sections. Comments are regenerated; variables"
            + " and escapes are not expanded.");
    choice(
        "csv",
        "CSV",
        "csv",
        "text/csv",
        "convert",
        "One table; null/missing cells become empty. Formula-like strings receive a leading"
            + " apostrophe.");
    choice(
        "tsv",
        "TSV",
        "tsv",
        "text/tab-separated-values",
        "convert",
        "Tab-separated table with the same cell rules as CSV.");
    choice(
        "xlsx",
        "Excel workbook",
        "xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "convert",
        "One sheet of text cells. No formulas, formatting, charts, or macros are retained.");
    choice(
        "txt",
        "Plain text",
        "txt",
        "text/plain",
        "extract",
        "Text content only; layout, images, and styling are not preserved. PDF OCR is not"
            + " available.");
    choice(
        "html",
        "HTML document",
        "html",
        "text/html",
        "convert",
        "Safe standalone HTML. Scripts and external resources are removed; office layout is not"
            + " retained.");
    choice(
        "md",
        "Markdown text",
        "md",
        "text/markdown",
        "extract",
        "Escaped text paragraphs; office styling is not reconstructed.");
    for (String f : List.of("png", "jpg", "bmp", "tiff"))
      choice(
          f,
          f.toUpperCase(),
          f,
          "image/" + (f.equals("jpg") ? "jpeg" : f),
          "convert",
          "First frame/page only; metadata removed. JPEG/BMP flatten transparency onto white."
              + " Orientation is kept as encoded pixels.");
    choice(
        "pdf",
        "PDF image",
        "pdf",
        "application/pdf",
        "convert",
        "One image on one PDF page; this does not create editable text.");
    choice(
        "png-zip",
        "PNG page images (ZIP)",
        "zip",
        "application/zip",
        "extract",
        "All pages rendered at 72 DPI into a ZIP, up to 10 pages.");
    choice(
        "jpg-zip",
        "JPG page images (ZIP)",
        "zip",
        "application/zip",
        "extract",
        "All pages rendered at 72 DPI into a ZIP, up to 10 pages.");
    choice(
        "zip",
        "ZIP archive",
        "zip",
        "application/zip",
        "convert",
        "Entry names and contents retained; permissions and other archive metadata are not"
            + " preserved.");
    choice(
        "tar",
        "TAR archive",
        "tar",
        "application/x-tar",
        "convert",
        "Uncompressed archive; contents are never extracted to the server filesystem.");
    choice(
        "tgz",
        "TAR.GZ archive",
        "tar.gz",
        "application/gzip",
        "convert",
        "Gzip-compressed TAR archive. Up to 200 entries and 20 MB expanded content.");
    choice(
        "7z",
        "7Z archive",
        "7z",
        "application/x-7z-compressed",
        "convert",
        "LZMA2-compressed archive; names and bytes retained, metadata omitted. No encryption or"
            + " links.");
    choice(
        "tbz2",
        "TAR.BZ2 archive",
        "tar.bz2",
        "application/x-bzip2",
        "convert",
        "Bzip2-compressed TAR. Up to 200 entries and 20 MB expanded content.");
    choice(
        "txz",
        "TAR.XZ archive",
        "tar.xz",
        "application/x-xz",
        "convert",
        "XZ-compressed TAR. Up to 200 entries and 20 MB expanded content.");
    choice(
        "bin",
        "Extract original bytes",
        "bin",
        "application/octet-stream",
        "extract",
        "Decompress Gzip, Bzip2, or XZ bytes. Original filename/type may not be recoverable; the"
            + " download uses .bin.");
  }

  private static void choice(
      String id, String label, String ext, String mime, String kind, String note) {
    OUTPUTS.put(id, new Choice(id, label, ext, mime, kind, note));
  }

  public Capabilities capabilities() {
    return new Capabilities(
        FileSupport.INPUT_LIMIT,
        FileSupport.OUTPUT_LIMIT,
        List.of(
            new Section(
                "data",
                "Data & Developer",
                List.of("JSON", "YAML", "TOML", "XML", "CSV", "TSV", "INI", "ENV"),
                "available"),
            new Section(
                "images",
                "Images",
                List.of("PNG", "JPG", "WEBP", "GIF", "BMP", "TIFF"),
                "available"),
            new Section(
                "documents",
                "Documents",
                List.of("PDF", "DOCX", "TXT", "Markdown", "HTML"),
                "available"),
            new Section(
                "spreadsheets", "Spreadsheets", List.of("XLS", "XLSX", "CSV", "TSV"), "available"),
            new Section(
                "archives",
                "Archives",
                List.of("ZIP", "7Z", "TAR", "TAR.GZ", "TAR.BZ2", "TAR.XZ", "GZ", "BZ2", "XZ"),
                "available"),
            new Section("presentations", "Presentations", List.of("PPT", "PPTX", "ODP"), "planned"),
            new Section("video", "Video", List.of("MP4", "MOV", "MKV", "WEBM"), "planned"),
            new Section("audio", "Audio", List.of("MP3", "WAV", "FLAC", "AAC", "OGG"), "planned"),
            new Section("ebooks", "E-books", List.of("EPUB", "MOBI", "AZW3"), "planned")));
  }

  private <T> T guarded(Supplier<T> action) {
    if (!slots.tryAcquire())
      throw new ApiException(
          HttpStatus.TOO_MANY_REQUESTS,
          "CONVERTER_BUSY",
          "The converter is busy. Please try again shortly.");
    try {
      return action.get();
    } finally {
      slots.release();
    }
  }

  public Inspection inspect(byte[] bytes, String filename) {
    return guarded(
        () -> {
          try {
            return inspection(bytes, filename, detect(bytes, filename, 0));
          } catch (ApiException e) {
            throw e;
          } catch (Exception e) {
            throw FileSupport.invalid(
                "This file appears to be corrupted, encrypted, or outside the supported format"
                    + " limits.");
          }
        });
  }

  private Inspection inspection(byte[] bytes, String filename, Source source) throws IOException {
    var warnings = new ArrayList<>(source.warnings());
    String ext = FileSupport.extension(filename);
    if (!ext.isEmpty() && !ext.equals(source.format()))
      warnings.addFirst(
          "The filename extension differs from the detected format. Conversion uses the detected"
              + " content.");
    return new Inspection(
        filename,
        bytes.length,
        source.format(),
        source.category(),
        source.details(),
        warnings,
        choices(source));
  }

  public Converted convert(
      byte[] bytes, String filename, String target, int sheet, int width, int quality) {
    return guarded(
        () -> {
          try {
            Source source = detect(bytes, filename, sheet);
            Choice choice =
                choices(source).stream()
                    .filter(c -> c.id().equals(target))
                    .findFirst()
                    .orElseThrow(
                        () ->
                            FileSupport.unsupported(
                                "This output is not available for the detected file. Choose one of"
                                    + " the offered formats."));
            byte[] result;
            if (source.category().equals("images"))
              result =
                  ImageConversions.write(
                      (java.awt.image.BufferedImage) source.value(), target, width, quality);
            else if (source.format().equals("pdf")) result = DocumentConversions.pdf(bytes, target);
            else if (source.category().equals("documents"))
              result = DocumentConversions.text((String) source.value(), source.format(), target);
            else if (Set.of("gz", "bz2", "xz").contains(source.format()))
              result = (byte[]) source.value();
            else if (source.category().equals("archives"))
              result = ArchiveConversions.pack(entries(source.value()), target);
            else result = DataConversions.write((JsonNode) source.value(), target);
            if (result.length > FileSupport.OUTPUT_LIMIT)
              throw FileSupport.invalid("The converted result exceeds the 20 MB limit.");
            return new Converted(
                result, FileSupport.filename(filename, choice.extension()), choice.mime());
          } catch (ApiException e) {
            throw e;
          } catch (Exception e) {
            throw FileSupport.invalid(
                "The conversion failed. This file may be corrupted or contain unsupported"
                    + " features.");
          }
        });
  }

  @SuppressWarnings("unchecked")
  private static Map<String, byte[]> entries(Object value) {
    return (Map<String, byte[]>) value;
  }

  private List<Choice> choices(Source source) throws IOException {
    if (source.value() == null) return List.of();
    var ids = new ArrayList<String>();
    if (source.category().equals("images")) ids.addAll(List.of("png", "jpg", "pdf", "bmp", "tiff"));
    else if (source.format().equals("pdf")) ids.addAll(List.of("txt", "png-zip", "jpg-zip"));
    else if (source.format().equals("docx")) ids.addAll(List.of("txt", "html", "md"));
    else if (source.format().equals("html")) ids.add("txt");
    else if (source.format().equals("md")) ids.add("html");
    else if (source.format().equals("txt")) ids.addAll(List.of("html", "md"));
    else if (Set.of("gz", "bz2", "xz").contains(source.format())) ids.add("bin");
    else if (source.category().equals("archives"))
      ids.addAll(List.of("zip", "tar", "tgz", "7z", "tbz2", "txz"));
    else {
      JsonNode value = (JsonNode) source.value();
      ids.addAll(List.of("json", "yaml"));
      try {
        DataConversions.toTable(value);
        ids.addAll(List.of("csv", "tsv", "xlsx"));
      } catch (ApiException ignored) {
      }
      if (value.isObject()) {
        for (String target : List.of("toml", "xml", "env", "ini")) {
          try {
            DataConversions.write(value, target);
            ids.add(target);
          } catch (Exception ignored) {
          }
        }
      }
    }
    if (!source.category().equals("images")) ids.remove(source.format());
    return ids.stream().map(OUTPUTS::get).toList();
  }

  private Source detect(byte[] bytes, String filename, int sheet) throws IOException {
    if (bytes.length == 0) throw FileSupport.invalid("Choose a nonempty file.");
    if (bytes.length > FileSupport.INPUT_LIMIT)
      throw new ApiException(
          HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "Files must be at most 5 MB.");
    if (filename.length() > 255)
      throw FileSupport.invalid("Use a filename of at most 255 characters.");
    if (FileSupport.prefix(bytes, 0x25, 0x50, 0x44, 0x46, 0x2d))
      return new Source(
          "pdf",
          "documents",
          bytes,
          Map.of("pages", DocumentConversions.pages(bytes)),
          List.of(
              "Text extraction requires a text layer. Scanned PDFs can be exported as page images;"
                  + " OCR is not included."));
    if (FileSupport.prefix(bytes, 0x50, 0x4b, 0x03, 0x04)
        || FileSupport.prefix(bytes, 0x50, 0x4b, 0x05, 0x06)) {
      var entries = ArchiveConversions.unpack(bytes, "zip");
      if (entries.containsKey("word/document.xml") && entries.containsKey("[Content_Types].xml"))
        return new Source(
            "docx",
            "documents",
            DocumentConversions.docx(bytes),
            Map.of(),
            List.of(
                "Text-based export only: original layout, embedded pictures, and formatting are not"
                    + " retained."));
      if (entries.containsKey("xl/workbook.xml") && entries.containsKey("[Content_Types].xml"))
        return spreadsheet(bytes, "xlsx", sheet);
      if (entries.containsKey("ppt/presentation.xml")) return recognized("pptx", "presentations");
      if (entries.containsKey("mimetype")) {
        String mime = new String(entries.get("mimetype"), StandardCharsets.US_ASCII).trim();
        if (mime.equals("application/epub+zip")) return recognized("epub", "ebooks");
        if (mime.equals("application/vnd.oasis.opendocument.text"))
          return recognized("odt", "documents");
        if (mime.equals("application/vnd.oasis.opendocument.spreadsheet"))
          return recognized("ods", "spreadsheets");
        if (mime.equals("application/vnd.oasis.opendocument.presentation"))
          return recognized("odp", "presentations");
        throw FileSupport.unsupported("This container's declared format is not supported yet.");
      }
      if (entries.containsKey("META-INF/container.xml")) return recognized("epub", "ebooks");
      return new Source(
          "zip",
          "archives",
          entries,
          Map.of("entries", entries.size()),
          List.of(
              "Only entry names and contents are preserved; links and archive metadata are not"
                  + " carried over."));
    }
    if (FileSupport.prefix(bytes, 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) {
      try (var ole = new POIFSFileSystem(new ByteArrayInputStream(bytes))) {
        if (ole.getRoot().hasEntry("WordDocument")) return recognized("doc", "documents");
        if (ole.getRoot().hasEntry("PowerPoint Document"))
          return recognized("ppt", "presentations");
        if (!ole.getRoot().hasEntry("Workbook") && !ole.getRoot().hasEntry("Book"))
          throw FileSupport.unsupported(
              "This legacy Office file is not a supported Excel workbook.");
      }
      return spreadsheet(bytes, "xls", sheet);
    }
    if (FileSupport.prefix(bytes, 0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c)) {
      var entries = ArchiveConversions.unpack(bytes, "7z");
      return new Source(
          "7z",
          "archives",
          entries,
          Map.of("entries", entries.size()),
          List.of(
              "Names and contents are preserved; archive metadata is omitted. Encrypted archives"
                  + " and links are not supported."));
    }
    String compression =
        FileSupport.prefix(bytes, 0x1f, 0x8b)
            ? "gz"
            : FileSupport.prefix(bytes, 0x42, 0x5a, 0x68)
                ? "bz2"
                : FileSupport.prefix(bytes, 0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00) ? "xz" : null;
    if (compression != null) {
      byte[] expanded = ArchiveConversions.expand(bytes, compression);
      if (tar(expanded)) {
        var entries = ArchiveConversions.unpack(expanded, "tar");
        String format =
            switch (compression) {
              case "gz" -> "tgz";
              case "bz2" -> "tbz2";
              default -> "txz";
            };
        return new Source(
            format,
            "archives",
            entries,
            Map.of("entries", entries.size()),
            List.of(
                "Names and contents are preserved; permissions and other archive metadata are"
                    + " omitted."));
      }
      return new Source(
          compression,
          "archives",
          expanded,
          Map.of("expandedBytes", expanded.length),
          List.of(
              "This contains compressed bytes, not a TAR archive. Extraction returns the original"
                  + " bytes as a .bin download."));
    }
    if (tar(bytes)) {
      var entries = ArchiveConversions.unpack(bytes, "tar");
      return new Source("tar", "archives", entries, Map.of("entries", entries.size()), List.of());
    }
    var image = ImageConversions.read(bytes);
    if (image != null && IMAGES.contains(image.format()))
      return new Source(
          image.format(),
          "images",
          image.pixels(),
          Map.of("width", image.pixels().getWidth(), "height", image.pixels().getHeight()),
          List.of(
              "First frame/page only. Metadata is removed; encoded pixel orientation is retained."
                  + " Transparency becomes white for JPEG/BMP."));
    String text = FileSupport.text(bytes),
        trimmed = text.stripLeading(),
        ext = FileSupport.extension(filename);
    if (text.isBlank()) throw FileSupport.invalid("Choose a file with content.");
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      // INI section headers are not JSON; all other malformed JSON-looking files are errors.
      if (!(ext.equals("ini") && trimmed.matches("(?s)^\\[[^\\]\\n]+\\]\\s*\\R.*")))
        return data(text, "json");
    }
    if (trimmed.matches("(?is)^(<!doctype\\s+html|<html[\\s>]).*"))
      return new Source(
          "html",
          "documents",
          text,
          Map.of(),
          List.of(
              "Scripts/styles are ignored during text extraction. Resources are never fetched."));
    if (trimmed.startsWith("<") && !ext.equals("html")) {
      if (trimmed.matches("(?is).*(?:<svg[\\s>]|xmlns=[\"']http://www.w3.org/2000/svg).*"))
        throw FileSupport.unsupported("SVG image conversion is not supported yet.");
      return data(text, "xml");
    }
    if (DATA.contains(ext)) return data(text, ext);
    if (ext.equals("md"))
      return new Source(
          "md",
          "documents",
          text,
          Map.of(),
          List.of(
              "Markdown is UTF-8 text; its extension disambiguates it from plain text. Embedded"
                  + " HTML is escaped."));
    if (ext.equals("html")) {
      if (!trimmed.matches("(?s)^<[A-Za-z][^>]*>.*"))
        throw FileSupport.invalid("This file does not contain recognizable HTML markup.");
      return new Source(
          "html",
          "documents",
          text,
          Map.of(),
          List.of("HTML is interpreted as text markup; scripts are not run."));
    }
    if (!ext.isEmpty() && !Set.of("txt", "log").contains(ext))
      throw FileSupport.unsupported(
          "This file format is not supported yet, or its contents do not match a recognized"
              + " format.");
    return new Source(
        "txt",
        "documents",
        text,
        Map.of(),
        List.of(
            "Recognized as UTF-8 plain text. Structured text formats may need their usual extension"
                + " to resolve ambiguity."));
  }

  private Source recognized(String format, String category) {
    return new Source(
        format,
        category,
        null,
        Map.of(),
        List.of(
            "The container format is recognized, but conversion for this format is not supported"
                + " yet."));
  }

  private Source data(String text, String format) throws IOException {
    JsonNode data = DataConversions.parse(text, format);
    var warnings = new ArrayList<String>();
    if (format.equals("xml"))
      warnings.add(
          "XML uses one root, @attributes, #text, and arrays for repeated children. Values remain"
              + " strings. Comments, processing instructions, and formatting are omitted; XML"
              + " whitespace normalization applies. Namespaces, mixed content, interleaved child"
              + " groups, DTDs, and external entities are rejected.");
    warnings.add(
        "Text syntax is validated; extensions help distinguish ambiguous text formats."
            + " Comments/layout are not preserved. ENV/INI values remain literal strings, without"
            + " variable or escape expansion.");
    return new Source(
        format,
        Set.of("csv", "tsv").contains(format) ? "spreadsheets" : "data",
        data,
        Map.of(),
        warnings);
  }

  private Source spreadsheet(byte[] bytes, String format, int sheet) throws IOException {
    return new Source(
        format,
        "spreadsheets",
        DataConversions.workbook(bytes, sheet),
        Map.of("sheets", DataConversions.sheets(bytes), "selectedSheet", sheet),
        List.of(
            "Only the selected sheet is exported (first sheet by default). Cells use displayed text"
                + " and cached formula results; formulas are never recalculated. Styling, charts,"
                + " and macros are not retained."));
  }

  private static boolean tar(byte[] bytes) {
    return bytes.length >= 512 && TarArchiveInputStream.matches(bytes, bytes.length);
  }
}
