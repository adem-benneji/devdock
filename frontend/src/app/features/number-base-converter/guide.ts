import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "decimal": {
    "input": "Enter an integer in decimal (10), without a base prefix, spaces, or fractions. A leading + or ASCII - is allowed.",
    "action": "Choose Input: decimal (10), then click Run tool. Uppercase and lowercase hexadecimal digits both work.",
    "output": "Exact decimal, hexadecimal, binary, and octal representations. Results are strings so large integers never lose precision.",
    "exampleInput": "255",
    "exampleOutput": "{\"decimal\":\"255\",\"hexadecimal\":\"FF\",\"binary\":\"11111111\",\"octal\":\"377\"}"
  },
  "hex": {
    "input": "Enter an integer in hexadecimal (16), without a base prefix, spaces, or fractions. A leading + or ASCII - is allowed.",
    "action": "Choose Input: hexadecimal (16), then click Run tool. Uppercase and lowercase hexadecimal digits both work.",
    "output": "Exact decimal, hexadecimal, binary, and octal representations. Results are strings so large integers never lose precision.",
    "exampleInput": "FF",
    "exampleOutput": "{\"decimal\":\"255\",\"hexadecimal\":\"FF\",\"binary\":\"11111111\",\"octal\":\"377\"}"
  },
  "binary": {
    "input": "Enter an integer in binary (2), without a base prefix, spaces, or fractions. A leading + or ASCII - is allowed.",
    "action": "Choose Input: binary (2), then click Run tool. Uppercase and lowercase hexadecimal digits both work.",
    "output": "Exact decimal, hexadecimal, binary, and octal representations. Results are strings so large integers never lose precision.",
    "exampleInput": "11111111",
    "exampleOutput": "{\"decimal\":\"255\",\"hexadecimal\":\"FF\",\"binary\":\"11111111\",\"octal\":\"377\"}"
  },
  "octal": {
    "input": "Enter an integer in octal (8), without a base prefix, spaces, or fractions. A leading + or ASCII - is allowed.",
    "action": "Choose Input: octal (8), then click Run tool. Uppercase and lowercase hexadecimal digits both work.",
    "output": "Exact decimal, hexadecimal, binary, and octal representations. Results are strings so large integers never lose precision.",
    "exampleInput": "377",
    "exampleOutput": "{\"decimal\":\"255\",\"hexadecimal\":\"FF\",\"binary\":\"11111111\",\"octal\":\"377\"}"
  }
};
