import type { Configuration } from './utility-config';
export const WORKFLOW_CONFIG: Record<string, Configuration> = {
  "json-schema-validator": {
    "label": "JSON document",
    "note": "Strict draft 2020-12 or draft-07 validation, including standard formats. No coercion, default insertion, or remote reference fetching. Use local $defs/definitions references. First failing branch reported; up to 100 errors. Worker limit: 3 seconds.",
    "modes": [
      {
        "value": "2020",
        "label": "Draft 2020-12"
      },
      {
        "value": "draft7",
        "label": "Draft-07"
      }
    ],
    "fields": [
      {
        "key": "schema",
        "label": "JSON Schema",
        "initial": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\n      \"type\": \"string\"\n    },\n    \"age\": {\n      \"type\": \"integer\",\n      \"minimum\": 0\n    }\n  },\n  \"required\": [\n    \"name\",\n    \"age\"\n  ],\n  \"additionalProperties\": false\n}",
        "multiline": true,
        "maxLength": 100000,
        "secret": false
      }
    ]
  },
  "sql-formatter": {
    "label": "SQL query",
    "note": "Formats SQL source only; never connects to a database or executes statements. Formatting does not prove a query is valid SQL. Select the appropriate dialect. Up to 100,000 characters and 3 seconds.",
    "modes": [
      {
        "value": "sql",
        "label": "Standard SQL"
      },
      {
        "value": "postgresql",
        "label": "PostgreSQL"
      },
      {
        "value": "mysql",
        "label": "MySQL"
      },
      {
        "value": "sqlite",
        "label": "SQLite"
      },
      {
        "value": "tsql",
        "label": "SQL Server"
      }
    ],
    "fields": []
  },
  "semver-tool": {
    "label": "Semantic version",
    "note": "Requires a strict major.minor.patch version, optionally with prerelease/build metadata. Comparison ignores build metadata. Range matching follows npm semver rules and excludes prereleases unless the range explicitly includes them.",
    "modes": [
      {
        "value": "inspect",
        "label": "Inspect version"
      },
      {
        "value": "major",
        "label": "Increment major"
      },
      {
        "value": "minor",
        "label": "Increment minor"
      },
      {
        "value": "patch",
        "label": "Increment patch"
      },
      {
        "value": "range",
        "label": "Match range"
      },
      {
        "value": "compare",
        "label": "Compare versions"
      }
    ],
    "fields": [
      {
        "key": "reference",
        "label": "Version or range (compare/range mode)",
        "initial": "^1.0.0",
        "multiline": false,
        "maxLength": 1000,
        "secret": false
      }
    ]
  },
  "hmac-signer": {
    "label": "Message to sign",
    "note": "HMAC with SHA-256, SHA-384, or SHA-512 using Web Crypto. Secret is exact UTF-8 text (1–4,096 characters), not hex/Base64. Signatures are hex without prefixes. Nothing is stored. Provider-specific timestamp/signature framing is not added.",
    "modes": [
      {
        "value": "sha256",
        "label": "Sign SHA256"
      },
      {
        "value": "sha384",
        "label": "Sign SHA384"
      },
      {
        "value": "sha512",
        "label": "Sign SHA512"
      },
      {
        "value": "verify-sha256",
        "label": "Verify SHA256"
      },
      {
        "value": "verify-sha384",
        "label": "Verify SHA384"
      },
      {
        "value": "verify-sha512",
        "label": "Verify SHA512"
      }
    ],
    "fields": [
      {
        "key": "secret",
        "label": "Secret key (UTF-8 text)",
        "initial": "",
        "multiline": false,
        "maxLength": 4096,
        "secret": true
      },
      {
        "key": "signature",
        "label": "Hex signature (verify mode)",
        "initial": "",
        "multiline": false,
        "maxLength": 128,
        "secret": false
      }
    ]
  },
  "pkce-generator": {
    "label": "PKCE verifier (derive mode)",
    "note": "Generate uses 32 cryptographically random bytes for a 43-character verifier. Derive accepts 43–128 ASCII letters, digits, hyphen, period, underscore, or tilde. Uses S256 only; does not send OAuth requests or store verifiers.",
    "modes": [
      {
        "value": "generate",
        "label": "Generate verifier & challenge"
      },
      {
        "value": "derive",
        "label": "Derive S256 challenge"
      }
    ],
    "fields": []
  },
  "ipv4-cidr": {
    "label": "IPv4 address/prefix",
    "note": "Enter dotted decimal IPv4 with prefix 0–32; leading-zero octets are rejected. /31 uses point-to-point host counting (2), /32 a single host (1). Results describe address arithmetic, not network reachability. IPv6 is not supported.",
    "modes": [
      {
        "value": "calculate",
        "label": "Calculate subnet"
      }
    ],
    "fields": [
      {
        "key": "member",
        "label": "Address to check (optional)",
        "initial": "",
        "multiline": false,
        "maxLength": 15,
        "secret": false
      }
    ]
  },
  "url-query-editor": {
    "label": "Absolute HTTP or HTTPS URL",
    "note": "Never visits the URL. Apply accepts a JSON object mapping keys to strings, arrays of strings, or null. Null/empty arrays delete keys. Other parameters and fragments remain. URL serialization may normalize encoding. Clean removes utm_*, gclid, dclid, fbclid, msclkid, and igshid. Embedded credentials are rejected.",
    "modes": [
      {
        "value": "apply",
        "label": "Apply parameter changes"
      },
      {
        "value": "clean",
        "label": "Remove tracking parameters"
      }
    ],
    "fields": [
      {
        "key": "changes",
        "label": "Parameter changes (JSON object)",
        "initial": "{\"q\":\"dev dock\",\"tag\":[\"api\",\"json\"],\"utm_source\":null}",
        "multiline": true,
        "maxLength": 100000,
        "secret": false
      }
    ]
  },
  "gzip-deflate": {
    "label": "Text or compressed Base64",
    "note": "Compression Streams handle gzip or zlib-wrapped deflate (not raw deflate). Compressed output/input is padded Base64. Decompression must produce UTF-8 text, with a 1,000,000-byte expansion limit and 3-second worker limit. Files and arbitrary binary output are not supported.",
    "modes": [
      {
        "value": "compress-gzip",
        "label": "Compress gzip"
      },
      {
        "value": "compress-deflate",
        "label": "Compress deflate"
      },
      {
        "value": "decompress-gzip",
        "label": "Decompress gzip"
      },
      {
        "value": "decompress-deflate",
        "label": "Decompress deflate"
      }
    ],
    "fields": []
  }
};
