import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "camel": {
    "input": "Type or paste a phrase or an existing identifier, such as words in camelCase.",
    "action": "Choose camelCase, then click Run tool.",
    "output": "Words joined together, with the first word lowercase and each following word capitalized.",
    "exampleInput": "Hello from Dev Dock",
    "exampleOutput": "helloFromDevDock"
  },
  "snake": {
    "input": "Type or paste a phrase or an existing identifier, such as words in camelCase.",
    "action": "Choose snake_case, then click Run tool.",
    "output": "Lowercase words separated by underscores.",
    "exampleInput": "Hello from Dev Dock",
    "exampleOutput": "hello_from_dev_dock"
  },
  "kebab": {
    "input": "Type or paste a phrase or an existing identifier, such as words in camelCase.",
    "action": "Choose kebab-case, then click Run tool.",
    "output": "Lowercase words separated by hyphens.",
    "exampleInput": "Hello from Dev Dock",
    "exampleOutput": "hello-from-dev-dock"
  },
  "upper": {
    "input": "Type or paste a phrase or an existing identifier, such as words in camelCase.",
    "action": "Choose UPPERCASE, then click Run tool.",
    "output": "Text in uppercase, with spaces and punctuation preserved.",
    "exampleInput": "Hello from Dev Dock",
    "exampleOutput": "HELLO FROM DEV DOCK"
  },
  "lower": {
    "input": "Type or paste a phrase or an existing identifier, such as words in camelCase.",
    "action": "Choose lowercase, then click Run tool.",
    "output": "Text in lowercase, with spaces and punctuation preserved.",
    "exampleInput": "Hello from Dev Dock",
    "exampleOutput": "hello from dev dock"
  }
};
