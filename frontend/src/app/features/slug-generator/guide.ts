import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "generate": {
    "input": "Enter a title, phrase, or name to use in a URL path.",
    "action": "Click Run tool. Decomposable accents are removed and punctuation becomes hyphens.",
    "output": "A lowercase slug containing Unicode letters, numbers, and single hyphens. Non-Latin letters are preserved; this tool does not ensure uniqueness.",
    "exampleInput": "Café & API: Hello, World!",
    "exampleOutput": "cafe-api-hello-world"
  }
};
