import type { UsageGuide } from '../shared/tool-guide';
export const WORKFLOW_GUIDES: Record<string, Record<string, UsageGuide>> = {
  "json-schema-validator": {
    "2020": {
      "input": "Enter the JSON document and its schema in the second editor. Choose the matching schema dialect.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "A valid flag and errors with JSON Pointer paths, failed keywords, and details. Schema errors appear separately.",
      "exampleInput": "{\"name\":\"Ada\",\"age\":37}",
      "exampleOutput": "valid: true; errors: []",
      "exampleFields": {
        "schema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\n      \"type\": \"string\"\n    },\n    \"age\": {\n      \"type\": \"integer\",\n      \"minimum\": 0\n    }\n  },\n  \"required\": [\n    \"name\",\n    \"age\"\n  ],\n  \"additionalProperties\": false\n}"
      },
      "exampleLabel": "Example (output summary)"
    },
    "draft7": {
      "input": "Enter the JSON document and its schema in the second editor. Choose the matching schema dialect.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "A valid flag and errors with JSON Pointer paths, failed keywords, and details. Schema errors appear separately.",
      "exampleInput": "{\"name\":\"Ada\",\"age\":37}",
      "exampleOutput": "valid: true; errors: []",
      "exampleFields": {
        "schema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\n      \"type\": \"string\"\n    },\n    \"age\": {\n      \"type\": \"integer\",\n      \"minimum\": 0\n    }\n  },\n  \"required\": [\n    \"name\",\n    \"age\"\n  ],\n  \"additionalProperties\": false\n}"
      },
      "exampleLabel": "Example (output summary)"
    }
  },
  "sql-formatter": {
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
  },
  "semver-tool": {
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
  },
  "hmac-signer": {
    "sha256": {
      "input": "Enter the exact message and secret key. To verify, also paste the expected hexadecimal signature and choose the matching algorithm.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "Signing returns lowercase hex. Verification returns matches: true or false. Whitespace in either message or key affects the result.",
      "exampleInput": "The quick brown fox jumps over the lazy dog",
      "exampleOutput": "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8",
      "exampleFields": {
        "secret": "key",
        "signature": "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
      },
      "exampleLabel": "Example (output summary)"
    },
    "verify-sha256": {
      "input": "Enter the exact message and secret key. To verify, also paste the expected hexadecimal signature and choose the matching algorithm.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "Signing returns lowercase hex. Verification returns matches: true or false. Whitespace in either message or key affects the result.",
      "exampleInput": "The quick brown fox jumps over the lazy dog",
      "exampleOutput": "matches: true",
      "exampleFields": {
        "secret": "key",
        "signature": "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
      },
      "exampleLabel": "Example (output summary)"
    },
    "sha384": {
      "input": "Enter the exact message and secret key. To verify, also paste the expected hexadecimal signature and choose the matching algorithm.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "Signing returns lowercase hex. Verification returns matches: true or false. Whitespace in either message or key affects the result.",
      "exampleInput": "The quick brown fox jumps over the lazy dog",
      "exampleOutput": "d7f4727e2c0b39ae0f1e40cc96f60242d5b7801841cea6fc592c5d3e1ae50700582a96cf35e1e554995fe4e03381c237",
      "exampleFields": {
        "secret": "key",
        "signature": "d7f4727e2c0b39ae0f1e40cc96f60242d5b7801841cea6fc592c5d3e1ae50700582a96cf35e1e554995fe4e03381c237"
      },
      "exampleLabel": "Example (output summary)"
    },
    "verify-sha384": {
      "input": "Enter the exact message and secret key. To verify, also paste the expected hexadecimal signature and choose the matching algorithm.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "Signing returns lowercase hex. Verification returns matches: true or false. Whitespace in either message or key affects the result.",
      "exampleInput": "The quick brown fox jumps over the lazy dog",
      "exampleOutput": "matches: true",
      "exampleFields": {
        "secret": "key",
        "signature": "d7f4727e2c0b39ae0f1e40cc96f60242d5b7801841cea6fc592c5d3e1ae50700582a96cf35e1e554995fe4e03381c237"
      },
      "exampleLabel": "Example (output summary)"
    },
    "sha512": {
      "input": "Enter the exact message and secret key. To verify, also paste the expected hexadecimal signature and choose the matching algorithm.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "Signing returns lowercase hex. Verification returns matches: true or false. Whitespace in either message or key affects the result.",
      "exampleInput": "The quick brown fox jumps over the lazy dog",
      "exampleOutput": "b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a",
      "exampleFields": {
        "secret": "key",
        "signature": "b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a"
      },
      "exampleLabel": "Example (output summary)"
    },
    "verify-sha512": {
      "input": "Enter the exact message and secret key. To verify, also paste the expected hexadecimal signature and choose the matching algorithm.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "Signing returns lowercase hex. Verification returns matches: true or false. Whitespace in either message or key affects the result.",
      "exampleInput": "The quick brown fox jumps over the lazy dog",
      "exampleOutput": "matches: true",
      "exampleFields": {
        "secret": "key",
        "signature": "b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a"
      },
      "exampleLabel": "Example (output summary)"
    }
  },
  "pkce-generator": {
    "generate": {
      "input": "For Generate, leave the editor empty; a fresh verifier is created. For Derive, paste your existing verifier exactly.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "JSON containing codeVerifier, codeChallenge, and codeChallengeMethod S256. Keep the verifier with your OAuth flow until token exchange.",
      "exampleInput": "",
      "exampleOutput": "A new random verifier and its S256 challenge on each run.",
      "exampleFields": {},
      "exampleLabel": "Example (output summary)"
    },
    "derive": {
      "input": "For Generate, leave the editor empty; a fresh verifier is created. For Derive, paste your existing verifier exactly.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "JSON containing codeVerifier, codeChallenge, and codeChallengeMethod S256. Keep the verifier with your OAuth flow until token exchange.",
      "exampleInput": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
      "exampleOutput": "codeChallenge: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
      "exampleFields": {},
      "exampleLabel": "Example (output summary)"
    }
  },
  "ipv4-cidr": {
    "calculate": {
      "input": "Enter an IPv4 CIDR such as 192.168.1.42/24. Optionally enter another address to test membership.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "Normalized network, netmask, wildcard, last address, usable-host range/count, and optional membership.",
      "exampleInput": "192.168.1.42/24",
      "exampleOutput": "cidr: 192.168.1.0/24; usableHostCount: 254; inSubnet: true",
      "exampleFields": {
        "member": "192.168.1.200"
      },
      "exampleLabel": "Example (output summary)"
    }
  },
  "url-query-editor": {
    "apply": {
      "input": "Enter a full HTTP/S URL. Apply mode also needs a JSON object of parameter changes; arrays create repeated parameters, null removes a parameter.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "The resulting URL as text. Clean mode removes common tracker keys without changing unrelated query values.",
      "exampleInput": "https://example.com/search?q=old&utm_source=newsletter#results",
      "exampleOutput": "https://example.com/search?q=dev+dock&tag=api&tag=json#results",
      "exampleFields": {
        "changes": "{\"q\":\"dev dock\",\"tag\":[\"api\",\"json\"],\"utm_source\":null}"
      },
      "exampleLabel": "Example (output summary)"
    },
    "clean": {
      "input": "Enter a full HTTP/S URL. Apply mode also needs a JSON object of parameter changes; arrays create repeated parameters, null removes a parameter.",
      "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
      "output": "The resulting URL as text. Clean mode removes common tracker keys without changing unrelated query values.",
      "exampleInput": "https://example.com/search?q=old&utm_source=newsletter#results",
      "exampleOutput": "https://example.com/search?q=old#results",
      "exampleFields": {
        "changes": "{\"q\":\"dev dock\",\"tag\":[\"api\",\"json\"],\"utm_source\":null}"
      },
      "exampleLabel": "Example (output summary)"
    }
  },
  "gzip-deflate": {
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
  }
};
