import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "sql": {
    "input": "Paste SQL source and select its database dialect.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Indented SQL with uppercase keywords. Quoted strings and comments are retained.",
    "exampleInput": "select id, name from users where active = 1 order by name;",
    "exampleOutput": "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1\nORDER BY\n  name;",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "postgresql": {
    "input": "Paste SQL source and select its database dialect.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Indented SQL with uppercase keywords. Quoted strings and comments are retained.",
    "exampleInput": "select id, name from users where active = 1 order by name;",
    "exampleOutput": "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1\nORDER BY\n  name;",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "mysql": {
    "input": "Paste SQL source and select its database dialect.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Indented SQL with uppercase keywords. Quoted strings and comments are retained.",
    "exampleInput": "select id, name from users where active = 1 order by name;",
    "exampleOutput": "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1\nORDER BY\n  name;",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "sqlite": {
    "input": "Paste SQL source and select its database dialect.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Indented SQL with uppercase keywords. Quoted strings and comments are retained.",
    "exampleInput": "select id, name from users where active = 1 order by name;",
    "exampleOutput": "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1\nORDER BY\n  name;",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "tsql": {
    "input": "Paste SQL source and select its database dialect.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Indented SQL with uppercase keywords. Quoted strings and comments are retained.",
    "exampleInput": "select id, name from users where active = 1 order by name;",
    "exampleOutput": "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1\nORDER BY\n  name;",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  }
};
