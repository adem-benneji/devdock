import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "v4": {
    "input": "Enter how many identifiers you need: a whole number from 1 to 100.",
    "action": "Click Run tool to generate a batch, then Copy result to copy the list.",
    "output": "One random UUID v4 per line. Your identifiers will differ from this example and on each run.",
    "exampleInput": "2",
    "exampleOutput": "550e8400-e29b-41d4-a716-446655440000\n6ba7b810-9dad-41d1-80b4-00c04fd430c8"
  }
};
