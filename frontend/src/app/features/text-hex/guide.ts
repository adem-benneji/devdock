import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "encode": {
    "input": "Enter valid Unicode text. Emoji and other languages are supported.",
    "action": "Choose Text → hex bytes and click Run tool.",
    "output": "Lowercase hexadecimal UTF-8 byte pairs separated by spaces. This is the text encoding, not a hash.",
    "exampleInput": "Hi 👋",
    "exampleOutput": "48 69 20 f0 9f 91 8b"
  },
  "decode": {
    "input": "Paste hexadecimal byte pairs, with optional whitespace and no 0x prefixes.",
    "action": "Choose Hex bytes → text and click Run tool.",
    "output": "Decoded UTF-8 text. Odd digits, invalid hex, and bytes that are not valid UTF-8 produce errors.",
    "exampleInput": "48 69 20 f0 9f 91 8b",
    "exampleOutput": "Hi 👋"
  }
};
