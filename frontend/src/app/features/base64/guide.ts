import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "encode": {
    "input": "Type or paste ordinary text. Emoji and other languages are supported.",
    "action": "Choose Encode to Base64, then click Run tool.",
    "output": "A Base64 text representation that can be decoded back to your original text.",
    "exampleInput": "Hello",
    "exampleOutput": "SGVsbG8="
  },
  "decode": {
    "input": "Paste Base64-encoded text, keeping any trailing = padding.",
    "action": "Choose Decode to text, then click Run tool.",
    "output": "The original readable UTF-8 text. Invalid Base64 or binary content produces an error.",
    "exampleInput": "SGVsbG8=",
    "exampleOutput": "Hello"
  }
};
