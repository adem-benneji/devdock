package com.devtools.tools.features.fileconverter;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.*;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

final class DocumentConversions {
  static void checkPdf(PDDocument pdf) throws IOException {
    if (pdf.isEncrypted()) throw FileSupport.invalid("Password-protected PDFs are not supported.");
    if (pdf.getNumberOfPages() < 1 || pdf.getNumberOfPages() > 10)
      throw FileSupport.invalid("Use PDFs with 1–10 pages for this converter.");
    for (var page : pdf.getPages()) {
      var box = page.getCropBox();
      if (!Float.isFinite(box.getWidth())
          || !Float.isFinite(box.getHeight())
          || box.getWidth() < 1
          || box.getHeight() < 1
          || (double) box.getWidth() * box.getHeight() > 2_000_000)
        throw FileSupport.invalid("PDF page dimensions exceed the supported rendering limit.");
    }
  }

  static int pages(byte[] bytes) throws IOException {
    try (var pdf = Loader.loadPDF(bytes)) {
      checkPdf(pdf);
      return pdf.getNumberOfPages();
    }
  }

  static String docx(byte[] bytes) throws IOException {
    try (var document = new XWPFDocument(new ByteArrayInputStream(bytes));
        var extractor = new XWPFWordExtractor(document)) {
      String text = extractor.getText();
      if (text.length() > FileSupport.TEXT_LIMIT)
        throw FileSupport.invalid("Document text exceeds 500,000 characters.");
      return text;
    }
  }

  static byte[] pdf(byte[] bytes, String target) throws IOException {
    try (var pdf = Loader.loadPDF(bytes)) {
      checkPdf(pdf);
      if (target.equals("txt")) {
        String text = new PDFTextStripper().getText(pdf);
        if (text.isBlank())
          throw FileSupport.invalid(
              "This PDF has no extractable text. Choose page images; OCR is not available yet.");
        return text.getBytes(StandardCharsets.UTF_8);
      }
      Map<String, byte[]> entries = new LinkedHashMap<>();
      var renderer = new PDFRenderer(pdf);
      renderer.setSubsamplingAllowed(true);
      String type = target.equals("png-zip") ? "png" : "jpg";
      int total = 0;
      for (int i = 0; i < pdf.getNumberOfPages(); i++) {
        byte[] page =
            ImageConversions.write(renderer.renderImageWithDPI(i, 72, ImageType.RGB), type, 0, 90);
        total += page.length;
        if (total > FileSupport.OUTPUT_LIMIT)
          throw FileSupport.invalid("Rendered pages exceed the 20 MB output limit.");
        entries.put(String.format(Locale.ROOT, "page-%03d.%s", i + 1, type), page);
      }
      return ArchiveConversions.pack(entries, "zip");
    }
  }

  static byte[] text(String source, String format, String target) {
    String output;
    if (target.equals("html")) {
      String body =
          format.equals("md")
              ? HtmlRenderer.builder()
                  .escapeHtml(true)
                  .sanitizeUrls(true)
                  .build()
                  .render(Parser.builder().build().parse(source))
              : "<pre>" + org.jsoup.nodes.Entities.escape(source) + "</pre>";
      body =
          Jsoup.clean(
              body, Safelist.basic().addTags("h1", "h2", "h3", "h4", "h5", "h6", "pre", "hr"));
      output =
          "<!doctype html><html><head><meta charset=\"UTF-8\"><meta"
              + " http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src"
              + " 'none'\"><title>Converted document</title></head><body>"
              + body
              + "</body></html>";
    } else if (target.equals("md")) {
      // Explicit text-only export: escape Markdown syntax, preserve paragraphs.
      output = source.replaceAll("([\\\\`*_{}\\[\\]()#+.!>~-])", "\\\\$1");
    } else if (format.equals("html")) {
      var doc = Jsoup.parse(source);
      doc.select("script,style,noscript,template").remove();
      output = doc.wholeText();
    } else output = source;
    return output.getBytes(StandardCharsets.UTF_8);
  }
}
