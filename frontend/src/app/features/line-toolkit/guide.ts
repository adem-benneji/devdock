import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "unique": {
    "input": "Paste one item per line. LF, CRLF, and CR line endings are accepted.",
    "action": "Choose Remove duplicate lines, then click Run tool.",
    "output": "Keep the first copy of each exact line, preserving order.",
    "exampleInput": "apple\nbanana\napple",
    "exampleOutput": "apple\nbanana"
  },
  "sort": {
    "input": "Paste one item per line. LF, CRLF, and CR line endings are accepted.",
    "action": "Choose Sort lines A → Z, then click Run tool.",
    "output": "Lines sorted by UTF-16 character order, with case and whitespace significant.",
    "exampleInput": "pear\napple\nbanana",
    "exampleOutput": "apple\nbanana\npear"
  },
  "reverse": {
    "input": "Paste one item per line. LF, CRLF, and CR line endings are accepted.",
    "action": "Choose Reverse line order, then click Run tool.",
    "output": "The same lines in the opposite order; characters inside each line stay unchanged.",
    "exampleInput": "first\nsecond\nthird",
    "exampleOutput": "third\nsecond\nfirst"
  },
  "trim": {
    "input": "Paste one item per line. LF, CRLF, and CR line endings are accepted.",
    "action": "Choose Trim each line, then click Run tool.",
    "output": "Leading and trailing whitespace removed from each line. Blank lines remain.",
    "exampleInput": "  apple  \n banana ",
    "exampleOutput": "apple\nbanana"
  },
  "nonblank": {
    "input": "Paste one item per line. LF, CRLF, and CR line endings are accepted.",
    "action": "Choose Remove blank lines, then click Run tool.",
    "output": "Empty and whitespace-only lines removed, preserving the other lines exactly.",
    "exampleInput": "apple\n   \nbanana",
    "exampleOutput": "apple\nbanana"
  }
};
