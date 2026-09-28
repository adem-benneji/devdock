package com.devtools.tools.shared;

import com.ibm.icu.text.BreakIterator;
import java.util.*;

public final class UnicodeSegments {
  public static List<String> segments(String input, boolean word) {
    BreakIterator iterator =
        word
            ? BreakIterator.getWordInstance(Locale.ENGLISH)
            : BreakIterator.getCharacterInstance(Locale.ENGLISH);
    iterator.setText(input);
    var result = new ArrayList<String>();
    int start = iterator.first();
    for (int end = iterator.next(); end != BreakIterator.DONE; start = end, end = iterator.next())
      if (!word || iterator.getRuleStatus() >= BreakIterator.WORD_NUMBER)
        result.add(input.substring(start, end));
    return result;
  }
}
