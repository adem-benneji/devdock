import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "encode": {
    "input": "Enter a single URL part, such as a search term or query parameter value.",
    "action": "Choose Encode component, then click Run tool.",
    "output": "Text with special characters replaced by percent escapes, ready to use as a URL component.",
    "exampleInput": "hello world&",
    "exampleOutput": "hello%20world%26"
  },
  "decode": {
    "input": "Paste a percent-encoded URL component.",
    "action": "Choose Decode component, then click Run tool.",
    "output": "Readable text with percent escapes decoded. Literal + signs remain unchanged.",
    "exampleInput": "hello%20world%26",
    "exampleOutput": "hello world&"
  }
};
