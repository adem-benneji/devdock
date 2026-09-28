import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "encode": {
    "input": "Type text containing characters such as &, <, >, quotes, or non-ASCII characters.",
    "action": "Choose Encode HTML entities and click Run tool.",
    "output": "Text using HTML character references where needed. Copy the source into the appropriate HTML text context.",
    "exampleInput": "<b>A & B</b>",
    "exampleOutput": "&lt;b&gt;A &amp; B&lt;/b&gt;"
  },
  "decode": {
    "input": "Paste valid named or numeric HTML references, including their semicolons.",
    "action": "Choose Decode HTML entities and click Run tool.",
    "output": "Decoded text shown literally. Any HTML tags remain text in this app; decoding does not make arbitrary HTML safe to render elsewhere.",
    "exampleInput": "&lt;b&gt;A &amp; B&lt;/b&gt;",
    "exampleOutput": "<b>A & B</b>"
  }
};
