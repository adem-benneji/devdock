import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "inspect": {
    "input": "Paste up to 1,000 Unicode code points to inspect.",
    "action": "Choose Inspect characters and click Run tool.",
    "output": "Code-point labels, UTF-16 offsets, UTF-8 hex bytes, and counts. A visible character can contain several code points; an emoji can use several UTF-16 units.",
    "exampleInput": "A👋",
    "exampleOutput": "U+0041 → 41, offset 0\nU+1F44B → f0 9f 91 8b, offset 1",
    "exampleLabel": "Example (output summary)"
  },
  "NFC": {
    "input": "Enter Unicode text to normalize. Combining marks may look identical before and after normalization.",
    "action": "Choose Normalize NFC and click Run tool.",
    "output": "NFC normalized text. Use Inspect characters afterward to compare code points. Compatibility forms may change character distinctions.",
    "exampleInput": "café",
    "exampleOutput": "café"
  },
  "NFD": {
    "input": "Enter Unicode text to normalize. Combining marks may look identical before and after normalization.",
    "action": "Choose Normalize NFD and click Run tool.",
    "output": "NFD normalized text. Use Inspect characters afterward to compare code points. Compatibility forms may change character distinctions.",
    "exampleInput": "café",
    "exampleOutput": "café"
  },
  "NFKC": {
    "input": "Enter Unicode text to normalize. Combining marks may look identical before and after normalization.",
    "action": "Choose Normalize NFKC and click Run tool.",
    "output": "NFKC normalized text. Use Inspect characters afterward to compare code points. Compatibility forms may change character distinctions.",
    "exampleInput": "Ａ café",
    "exampleOutput": "A café"
  },
  "NFKD": {
    "input": "Enter Unicode text to normalize. Combining marks may look identical before and after normalization.",
    "action": "Choose Normalize NFKD and click Run tool.",
    "output": "NFKD normalized text. Use Inspect characters afterward to compare code points. Compatibility forms may change character distinctions.",
    "exampleInput": "Ａ café",
    "exampleOutput": "A café"
  }
};
