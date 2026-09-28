import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
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
};
