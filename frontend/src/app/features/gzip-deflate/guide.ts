import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "compress-gzip": {
    "input": "Compression accepts plain text. Decompression accepts padded Base64 containing the selected compressed format.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Compression returns Base64; decompression returns the original UTF-8 text. Select the same format in both directions.",
    "exampleInput": "Hello DevDock",
    "exampleOutput": "H4sIAAAAAAAC//NIzcnJV3BJLXPJT84GAFHKEO4NAAAA",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "decompress-gzip": {
    "input": "Compression accepts plain text. Decompression accepts padded Base64 containing the selected compressed format.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Compression returns Base64; decompression returns the original UTF-8 text. Select the same format in both directions.",
    "exampleInput": "H4sIAAAAAAAC//NIzcnJV3BJLXPJT84GAFHKEO4NAAAA",
    "exampleOutput": "Hello DevDock",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "compress-deflate": {
    "input": "Compression accepts plain text. Decompression accepts padded Base64 containing the selected compressed format.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Compression returns Base64; decompression returns the original UTF-8 text. Select the same format in both directions.",
    "exampleInput": "Hello DevDock",
    "exampleOutput": "eJzzSM3JyVdwSS1zyU/OBgAgSgS1",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "decompress-deflate": {
    "input": "Compression accepts plain text. Decompression accepts padded Base64 containing the selected compressed format.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Compression returns Base64; decompression returns the original UTF-8 text. Select the same format in both directions.",
    "exampleInput": "eJzzSM3JyVdwSS1zyU/OBgAgSgS1",
    "exampleOutput": "Hello DevDock",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  }
};
