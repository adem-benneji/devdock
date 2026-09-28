import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "inspect": {
    "input": "Enter text or load the mixed-newline example. Browser textareas may normalize pasted newlines.",
    "action": "Choose Inspect line endings and click Run tool.",
    "output": "Separate CRLF, lone LF, and lone CR counts, plus whether the text begins with a Unicode BOM.",
    "exampleInput": "first\r\nsecond\nthird\r",
    "exampleOutput": "{\"crlf\":1,\"lf\":1,\"cr\":1,\"leadingBom\":false}"
  },
  "lf": {
    "input": "Enter text with any mix of CRLF, LF, or CR line endings.",
    "action": "Choose Convert to LF, run the tool, then Copy result to preserve the generated line-ending bytes.",
    "output": "Text with all line breaks normalized to LF. A final newline is preserved if present. The on-screen textarea may display line endings uniformly.",
    "exampleInput": "first\r\nsecond\n",
    "exampleOutput": "first\nsecond\n"
  },
  "crlf": {
    "input": "Enter text with any mix of CRLF, LF, or CR line endings.",
    "action": "Choose Convert to CRLF, run the tool, then Copy result to preserve the generated line-ending bytes.",
    "output": "Text with all line breaks normalized to CRLF. A final newline is preserved if present. The on-screen textarea may display line endings uniformly.",
    "exampleInput": "first\r\nsecond\n",
    "exampleOutput": "first\r\nsecond\r\n"
  },
  "cr": {
    "input": "Enter text with any mix of CRLF, LF, or CR line endings.",
    "action": "Choose Convert to CR, run the tool, then Copy result to preserve the generated line-ending bytes.",
    "output": "Text with all line breaks normalized to CR. A final newline is preserved if present. The on-screen textarea may display line endings uniformly.",
    "exampleInput": "first\r\nsecond\n",
    "exampleOutput": "first\rsecond\r"
  },
  "strip-bom": {
    "input": "Enter text that may begin with the invisible U+FEFF byte-order-mark character.",
    "action": "Choose Remove leading BOM and click Run tool.",
    "output": "Text with at most one leading BOM removed. Other characters and line breaks stay unchanged.",
    "exampleInput": "﻿hello",
    "exampleOutput": "hello"
  }
};
