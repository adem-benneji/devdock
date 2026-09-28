import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "inspect": {
    "input": "Enter a complete semantic version. For comparison enter another version; for range matching enter an npm version range in the second field.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Version components, an incremented version, a precedence result, or a range match, depending on the operation.",
    "exampleInput": "1.2.3",
    "exampleOutput": "major: 1; minor: 2; patch: 3",
    "exampleFields": {
      "reference": "^1.0.0"
    },
    "exampleLabel": "Example (output summary)"
  },
  "major": {
    "input": "Enter a complete semantic version. For comparison enter another version; for range matching enter an npm version range in the second field.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Version components, an incremented version, a precedence result, or a range match, depending on the operation.",
    "exampleInput": "1.2.3",
    "exampleOutput": "2.0.0",
    "exampleFields": {
      "reference": "^1.0.0"
    },
    "exampleLabel": "Example (output summary)"
  },
  "minor": {
    "input": "Enter a complete semantic version. For comparison enter another version; for range matching enter an npm version range in the second field.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Version components, an incremented version, a precedence result, or a range match, depending on the operation.",
    "exampleInput": "1.2.3",
    "exampleOutput": "1.3.0",
    "exampleFields": {
      "reference": "^1.0.0"
    },
    "exampleLabel": "Example (output summary)"
  },
  "patch": {
    "input": "Enter a complete semantic version. For comparison enter another version; for range matching enter an npm version range in the second field.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Version components, an incremented version, a precedence result, or a range match, depending on the operation.",
    "exampleInput": "1.2.3",
    "exampleOutput": "1.2.4",
    "exampleFields": {
      "reference": "^1.0.0"
    },
    "exampleLabel": "Example (output summary)"
  },
  "range": {
    "input": "Enter a complete semantic version. For comparison enter another version; for range matching enter an npm version range in the second field.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Version components, an incremented version, a precedence result, or a range match, depending on the operation.",
    "exampleInput": "1.2.3",
    "exampleOutput": "satisfies: true",
    "exampleFields": {
      "reference": "^1.0.0"
    },
    "exampleLabel": "Example (output summary)"
  },
  "compare": {
    "input": "Enter a complete semantic version. For comparison enter another version; for range matching enter an npm version range in the second field.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Version components, an incremented version, a precedence result, or a range match, depending on the operation.",
    "exampleInput": "1.2.3",
    "exampleOutput": "precedence: lower",
    "exampleFields": {
      "reference": "1.3.0"
    },
    "exampleLabel": "Example (output summary)"
  }
};
