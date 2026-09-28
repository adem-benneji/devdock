import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "count": {
    "input": "Paste a sentence, paragraph, or longer text. Empty text returns zero counts.",
    "action": "Click Run tool to measure the exact text, including spaces and line breaks.",
    "output": "Word and visible-character counts, characters excluding whitespace, lines, UTF-8 bytes, and estimated reading seconds at 200 words per minute.",
    "exampleInput": "Hello world!",
    "exampleOutput": "{\"words\":2,\"characters\":12,\"charactersWithoutWhitespace\":11,\"lines\":1,\"utf8Bytes\":12,\"estimatedReadingSeconds\":1}"
  }
};
