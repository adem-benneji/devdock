package com.devtools.tools.features.sluggenerator;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.text.Normalizer;
import java.util.*;

/** Backend implementation of the slug-generator tool. */
public final class SlugGeneratorTool implements ToolProcessor {
  @Override
  public String id() {
    return "slug-generator";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    String slug =
        Normalizer.normalize(input, Normalizer.Form.NFKD)
            .replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^\\p{L}\\p{N}]+", "-")
            .replaceAll("^-|-$", "");
    if (slug.isEmpty()) throw invalid("Enter text containing letters or numbers.");
    return slug;
  }
}
