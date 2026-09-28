package com.devtools.tools.features.fileconverter;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import javax.imageio.*;
import javax.imageio.stream.*;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;

final class ImageConversions {
  record Image(String format, BufferedImage pixels) {}

  static Image read(byte[] bytes) throws IOException {
    try (var input = new MemoryCacheImageInputStream(new ByteArrayInputStream(bytes))) {
      var readers = ImageIO.getImageReaders(input);
      if (!readers.hasNext()) return null;
      var reader = readers.next();
      try {
        reader.setInput(input, true, true);
        int w = reader.getWidth(0), h = reader.getHeight(0);
        if (w < 1 || h < 1 || (long) w * h > 12_000_000 || w > 12000 || h > 12000)
          throw FileSupport.invalid(
              "Images must be at most 12 megapixels and 12,000 pixels per side.");
        String format = reader.getFormatName().toLowerCase();
        if (format.equals("jpeg")) format = "jpg";
        if (format.equals("tif")) format = "tiff";
        return new Image(format, reader.read(0));
      } finally {
        reader.dispose();
      }
    }
  }

  static byte[] write(BufferedImage original, String target, int maxWidth, int quality)
      throws IOException {
    if (maxWidth < 0 || maxWidth > 12000 || quality < 1 || quality > 100)
      throw FileSupport.invalid(
          "Choose a width from 1–12,000 (or 0 for original), and quality from 1–100.");
    int width = maxWidth == 0 ? original.getWidth() : Math.min(maxWidth, original.getWidth());
    int height =
        Math.max(1, (int) Math.round((double) original.getHeight() * width / original.getWidth()));
    boolean opaque = target.equals("jpg") || target.equals("bmp");
    BufferedImage pixels =
        new BufferedImage(
            width, height, opaque ? BufferedImage.TYPE_INT_RGB : BufferedImage.TYPE_INT_ARGB);
    Graphics2D graphics = pixels.createGraphics();
    if (opaque) {
      graphics.setColor(Color.WHITE);
      graphics.fillRect(0, 0, width, height);
    }
    graphics.setRenderingHint(
        RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
    graphics.drawImage(original, 0, 0, width, height, null);
    graphics.dispose();
    var output = new FileSupport.Output();
    if (target.equals("pdf")) {
      try (var pdf = new PDDocument()) {
        float scale = Math.min(1f, 1440f / Math.max(width, height));
        var page = new PDPage(new PDRectangle(width * scale, height * scale));
        pdf.addPage(page);
        try (var content = new PDPageContentStream(pdf, page)) {
          content.drawImage(
              LosslessFactory.createFromImage(pdf, pixels), 0, 0, width * scale, height * scale);
        }
        pdf.save(output);
      }
    } else {
      var writers = ImageIO.getImageWritersByFormatName(target);
      if (!writers.hasNext()) throw FileSupport.unsupported("This image output is not available.");
      var writer = writers.next();
      try (var sink = new MemoryCacheImageOutputStream(output)) {
        writer.setOutput(sink);
        var options = writer.getDefaultWriteParam();
        if (target.equals("jpg")) {
          options.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
          options.setCompressionQuality(quality / 100f);
        }
        writer.write(null, new IIOImage(pixels, null, null), options);
      } finally {
        writer.dispose();
      }
    }
    return output.toByteArray();
  }
}
