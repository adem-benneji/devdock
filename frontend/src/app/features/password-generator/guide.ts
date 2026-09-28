import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "mixed": {
    "input": "Enter a whole-number length from 8 to 128. The default is 24 characters.",
    "action": "Choose Letters, digits & symbols, then Run tool. Each run generates a new password.",
    "output": "One randomly generated password of the requested length. Your result will differ from this example. Passwords are never saved by this tool.",
    "exampleInput": "24",
    "exampleOutput": "7k!pA2$zQ9#mB4@xR6&vN8?c",
    "exampleLabel": "Illustrative example; do not reuse this password"
  },
  "alphanumeric": {
    "input": "Enter a whole-number length from 8 to 128. The default is 24 characters.",
    "action": "Choose Letters & digits, then Run tool. Each run generates a new password.",
    "output": "One randomly generated password of the requested length. Your result will differ from this example. Passwords are never saved by this tool.",
    "exampleInput": "24",
    "exampleOutput": "7kpA2zQ9mB4xR6vN8cT3sH5w",
    "exampleLabel": "Illustrative example; do not reuse this password"
  }
};
