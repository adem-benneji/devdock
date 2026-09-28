package com.devtools.tools.features.fileconverter;

import static org.assertj.core.api.Assertions.*;

import com.devtools.tools.ApiException;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.*;
import javax.imageio.ImageIO;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.*;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class FileConversionTests {
  private final FileConversionService service = new FileConversionService();

  private byte[] utf(String value) {
    return value.getBytes(StandardCharsets.UTF_8);
  }

  private FileConversionService.Converted convert(byte[] bytes, String name, String target) {
    return service.convert(bytes, name, target, 0, 0, 90);
  }

  @Test
  void detectsActualImageInsteadOfExtensionAndConvertsRealBytes() throws Exception {
    byte[] png = image("png");
    var info = service.inspect(png, "wrong.jpg");
    assertThat(info.format()).isEqualTo("png");
    assertThat(info.warnings().getFirst()).contains("filename extension");
    assertThat(info.outputs())
        .extracting(FileConversionService.Choice::id)
        .contains("png", "jpg", "pdf")
        .doesNotContain("json", "xlsx");
    var jpeg = service.convert(png, "wrong.jpg", "jpg", 0, 2, 80);
    assertThat(ImageIO.read(new ByteArrayInputStream(jpeg.bytes())).getWidth()).isEqualTo(2);
    assertThat(service.inspect(jpeg.bytes(), jpeg.filename()).format()).isEqualTo("jpg");
    assertThat(service.inspect(convert(png, "pic.png", "pdf").bytes(), "image.pdf").details())
        .containsEntry("pages", 1);
  }

  @ParameterizedTest
  @ValueSource(strings = {"png", "jpg", "gif", "bmp", "tiff"})
  void eachImageReaderProducesUsableOutputs(String format) throws Exception {
    byte[] input = image(format);
    assertThat(service.inspect(input, "misnamed.bin").format()).isEqualTo(format);
    for (String target : List.of("png", "jpg", "bmp", "tiff"))
      assertThat(
              ImageIO.read(
                      new ByteArrayInputStream(convert(input, "picture." + format, target).bytes()))
                  .getHeight())
          .isEqualTo(3);
  }

  private byte[] image(String format) throws IOException {
    var buffer = new ByteArrayOutputStream();
    assertThat(ImageIO.write(new BufferedImage(4, 3, BufferedImage.TYPE_INT_RGB), format, buffer))
        .isTrue();
    return buffer.toByteArray();
  }

  @Test
  void dynamicDataOutputsDependOnRepresentableValues() {
    var object = service.inspect(utf("{\"nested\":{\"name\":\"Ada\"}}"), "wrong.jpg");
    assertThat(object.format()).isEqualTo("json");
    assertThat(object.outputs())
        .extracting(FileConversionService.Choice::id)
        .contains("yaml", "toml")
        .doesNotContain("csv", "xlsx");
    var array = service.inspect(utf("[{\"name\":\"Ada\"}]"), "data.json");
    assertThat(array.outputs())
        .extracting(FileConversionService.Choice::id)
        .contains("csv", "tsv", "xlsx")
        .doesNotContain("toml");
    assertThatThrownBy(() -> convert(utf("{}"), "data.json", "jpg"))
        .isInstanceOf(ApiException.class)
        .hasMessageContaining("not available");
  }

  @ParameterizedTest
  @ValueSource(strings = {"json", "yaml", "toml", "ini", "env"})
  void configurationFormatsProduceParsedJsonAndYaml(String format) throws Exception {
    String input =
        switch (format) {
          case "json" -> "{\"name\":\"Ada\"}";
          case "yaml" -> "name: Ada\n";
          case "toml" -> "name = \"Ada\"\n";
          default -> "name=Ada\n";
        };
    var info = service.inspect(utf(input), "config." + format);
    assertThat(info.format()).isEqualTo(format);
    String target = format.equals("json") ? "yaml" : "json";
    byte[] output = convert(utf(input), "config." + format, target).bytes();
    assertThat(
            DataConversions.parse(new String(output, StandardCharsets.UTF_8), target)
                .get("name")
                .asText())
        .isEqualTo("Ada");
  }

  @Test
  void preservesLargeJsonNumbersAndRejectsDuplicateOrAmbiguousData() throws Exception {
    var output = convert(utf("{\"id\":123456789012345678901234567890}"), "data.json", "yaml");
    assertThat(
            DataConversions.parse(new String(output.bytes(), StandardCharsets.UTF_8), "yaml")
                .get("id")
                .asText())
        .isEqualTo("123456789012345678901234567890");
    for (String input : List.of("{\"a\":1,\"a\":2}", "{} {}", "[1,]"))
      assertThatThrownBy(() -> service.inspect(utf(input), "bad.json"))
          .isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> service.inspect(utf("a: 1\na: 2"), "bad.yaml"))
        .isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> service.inspect(utf("KEY=x\nKEY=y"), "bad.env"))
        .isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> service.inspect(utf("a,b\n1,2,3"), "bad.csv"))
        .isInstanceOf(ApiException.class);
  }

  @Test
  void yamlRejectsAliasesAndCustomTagsWithoutChangingBooleanLikeWords() throws Exception {
    for (String source : List.of("a: &x 1\nb: *x", "a: !custom value"))
      assertThatThrownBy(() -> service.inspect(utf(source), "config.yaml"))
          .isInstanceOf(ApiException.class);
    var value = DataConversions.parse("enabled: true\nword: on\n", "yaml");
    assertThat(value.get("enabled").isBoolean()).isTrue();
    assertThat(value.get("word").asText()).isEqualTo("on");
  }

  @Test
  void csvTsvAndWorkbookKeepStringCellsAndPreventFormulaExecution() throws Exception {
    byte[] csv = utf("name,id\n\"Ada, A\",001\n=2+2,9007199254740993\n");
    var json = convert(csv, "table.csv", "json");
    assertThat(new String(json.bytes(), StandardCharsets.UTF_8))
        .contains("001", "9007199254740993", "Ada, A");
    var tsv = convert(csv, "table.csv", "tsv");
    assertThat(new String(tsv.bytes(), StandardCharsets.UTF_8)).contains("'=");
    var excel = convert(csv, "table.csv", "xlsx");
    try (var workbook = new XSSFWorkbook(new ByteArrayInputStream(excel.bytes()))) {
      assertThat(workbook.getSheetAt(0).getRow(2).getCell(0).getCellType())
          .isEqualTo(org.apache.poi.ss.usermodel.CellType.STRING);
      assertThat(workbook.getSheetAt(0).getRow(1).getCell(1).getStringCellValue()).isEqualTo("001");
    }
    assertThat(service.inspect(excel.bytes(), "table.zip").format()).isEqualTo("xlsx");
  }

  @ParameterizedTest
  @ValueSource(strings = {"xls", "xlsx"})
  void workbookSheetSelectionExportsRequestedSheet(String format) throws Exception {
    var out = new ByteArrayOutputStream();
    try (org.apache.poi.ss.usermodel.Workbook book =
        format.equals("xls") ? new HSSFWorkbook() : new XSSFWorkbook()) {
      for (String name : List.of("First", "Second")) {
        var sheet = book.createSheet(name);
        sheet.createRow(0).createCell(0).setCellValue("name");
        sheet.createRow(1).createCell(0).setCellValue(name);
      }
      book.write(out);
    }
    assertThat(service.inspect(out.toByteArray(), "book." + format).details().get("sheets"))
        .isEqualTo(List.of("First", "Second"));
    assertThat(
            new String(
                service.convert(out.toByteArray(), "book." + format, "json", 1, 0, 90).bytes(),
                StandardCharsets.UTF_8))
        .contains("Second")
        .doesNotContain("First");
    assertThatThrownBy(
            () -> service.convert(out.toByteArray(), "book." + format, "json", 10, 0, 90))
        .hasMessageContaining("Choose a sheet");
  }

  @Test
  void docxExportsTextAndSafeHtmlWithoutPretendingToPreserveLayout() throws Exception {
    var output = new ByteArrayOutputStream();
    try (var doc = new XWPFDocument()) {
      doc.createParagraph().createRun().setText("Hello <script>alert(1)</script> Ada");
      doc.write(output);
    }
    byte[] bytes = output.toByteArray();
    assertThat(service.inspect(bytes, "doc.zip").format()).isEqualTo("docx");
    assertThat(new String(convert(bytes, "doc.docx", "txt").bytes(), StandardCharsets.UTF_8))
        .contains("Hello");
    assertThat(new String(convert(bytes, "doc.docx", "html").bytes(), StandardCharsets.UTF_8))
        .contains("&lt;script&gt;")
        .doesNotContain("<script>");
    assertThat(new String(convert(bytes, "doc.docx", "md").bytes(), StandardCharsets.UTF_8))
        .contains("Ada");
  }

  @Test
  void markdownRendersSafeStandaloneHtmlAndHtmlExtractsTextWithoutFetching() {
    String html =
        new String(
            convert(
                    utf("# Hello\n\n<script>alert(1)</script>\n[bad](javascript:alert(1))"),
                    "note.md",
                    "html")
                .bytes(),
            StandardCharsets.UTF_8);
    assertThat(html)
        .contains("<h1>Hello</h1>", "Content-Security-Policy")
        .doesNotContain("<script>", "href=\"javascript:");
    String text =
        new String(
            convert(
                    utf(
                        "<!doctype html><html><body><p>Hello</p><script>secret</script><img"
                            + " src='https://example.com/private'></body></html>"),
                    "note.html",
                    "txt")
                .bytes(),
            StandardCharsets.UTF_8);
    assertThat(text).contains("Hello").doesNotContain("secret");
  }

  @Test
  void pdfExtractsTextAndRendersDownloadablePageArchive() throws Exception {
    var out = new ByteArrayOutputStream();
    try (var doc = new PDDocument()) {
      var page = new PDPage();
      doc.addPage(page);
      try (var content = new PDPageContentStream(doc, page)) {
        content.beginText();
        content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
        content.newLineAtOffset(50, 700);
        content.showText("Hello DevDock");
        content.endText();
      }
      doc.save(out);
    }
    byte[] pdf = out.toByteArray();
    assertThat(service.inspect(pdf, "wrong.txt").format()).isEqualTo("pdf");
    assertThat(new String(convert(pdf, "report.pdf", "txt").bytes(), StandardCharsets.UTF_8))
        .contains("Hello DevDock");
    for (String target : List.of("png-zip", "jpg-zip")) {
      var entries = ArchiveConversions.unpack(convert(pdf, "report.pdf", target).bytes(), "zip");
      assertThat(entries).hasSize(1);
      assertThat(ImageIO.read(new ByteArrayInputStream(entries.values().iterator().next())))
          .isNotNull();
    }
  }

  @Test
  void archiveConversionsRoundTripEntriesAndGzipExtractsExactBytes() throws Exception {
    Map<String, byte[]> entries = new LinkedHashMap<>();
    entries.put("folder/", new byte[0]);
    entries.put("folder/a.txt", utf("hello"));
    entries.put("b.bin", new byte[] {0, 1, 2, -1});
    for (String source : List.of("zip", "tar", "tgz")) {
      byte[] bytes = ArchiveConversions.pack(entries, source);
      assertThat(service.inspect(bytes, "archive.bin").format()).isEqualTo(source);
      for (String target : List.of("zip", "tar", "tgz")) {
        if (source.equals(target)) continue;
        var result =
            ArchiveConversions.unpack(convert(bytes, "archive." + source, target).bytes(), target);
        assertThat(result.keySet()).isEqualTo(entries.keySet());
        for (String key : entries.keySet())
          assertThat(result.get(key)).containsExactly(entries.get(key));
      }
    }
    var out = new ByteArrayOutputStream();
    try (var gzip = new GZIPOutputStream(out)) {
      gzip.write(new byte[] {0, 1, 2, -1});
    }
    assertThat(convert(out.toByteArray(), "file.gz", "bin").bytes()).containsExactly(0, 1, 2, -1);
  }

  @Test
  void recognizesUnsupportedOfficeContainersWithoutOfferingArchiveConversions() throws Exception {
    byte[] epub =
        ArchiveConversions.pack(
            Map.of(
                "mimetype",
                utf("application/epub+zip"),
                "META-INF/container.xml",
                utf("<container/>")),
            "zip");
    var info = service.inspect(epub, "book.zip");
    assertThat(info.format()).isEqualTo("epub");
    assertThat(info.outputs()).isEmpty();
    assertThatThrownBy(() -> convert(epub, "book.epub", "tar"))
        .hasMessageContaining("not available");
  }

  @Test
  void rejectsUnsafeCorruptOversizedAndUnrecognizedInputs() throws Exception {
    var badZip = ArchiveConversions.pack(Map.of("../escape.txt", utf("x")), "zip");
    assertThatThrownBy(() -> service.inspect(badZip, "bad.zip")).hasMessageContaining("unsafe");
    byte[] goodZip = ArchiveConversions.pack(Map.of("a.txt", utf("x")), "zip");
    assertThatThrownBy(
            () -> service.inspect(Arrays.copyOf(goodZip, goodZip.length - 22), "bad.zip"))
        .isInstanceOf(ApiException.class);
    var bomb = new ByteArrayOutputStream();
    try (var gzip = new GZIPOutputStream(bomb)) {
      gzip.write(new byte[20_000_001]);
    }
    assertThatThrownBy(() -> service.inspect(bomb.toByteArray(), "bomb.gz"))
        .isInstanceOf(ApiException.class)
        .hasMessageContaining("size limit");
    for (byte[] bytes : List.of(new byte[0], new byte[] {0, 1, 2}, new byte[5_000_001]))
      assertThatThrownBy(() -> service.inspect(bytes, "bad.bin")).isInstanceOf(ApiException.class);
    assertThatThrownBy(() -> service.inspect(utf("<svg></svg>"), "vector.svg"))
        .hasMessageContaining("not supported");
    assertThatThrownBy(() -> service.inspect(utf("arbitrary text"), "unknown.exe"))
        .hasMessageContaining("not supported");
  }
}
