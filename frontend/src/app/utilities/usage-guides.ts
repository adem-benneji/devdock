import { WORKFLOW_GUIDES } from './workflow-guides';
import { ADVANCED_GUIDES } from './advanced-guides';
import { CONVERSION_GUIDES } from './conversion-guides';
import { UsageGuide } from '../shared/tool-guide';

const SAMPLE = '{"users":[{"name":"Ada","active":true},{"name":"Lin","active":false}]}';
export const UTILITY_GUIDES: Record<string, Record<string, UsageGuide>> = {
  ...CONVERSION_GUIDES,
  ...ADVANCED_GUIDES,
  ...WORKFLOW_GUIDES,
  'jsonpath-tester': { query: {
    input: 'Paste a valid JSON document and enter a JSONPath expression. For example, $.users[*].name selects each user’s name.',
    action: 'Click Load example to fill both fields, then Run tool. Use $ for the root, [0] for an index, or ..name for recursive lookup.',
    output: 'A match count and a list of paths with their values. No matches returns an empty list. Filters containing scripts are not supported.',
    exampleInput: SAMPLE, exampleOutput: '{"count":2,"matches":[{"path":"$[\'users\'][0][\'name\']","value":"Ada"},{"path":"$[\'users\'][1][\'name\']","value":"Lin"}]}',
  } },
  'json-to-typescript': { generate: {
    input: 'Paste sample JSON with the fields and values your application receives. Quote large numeric IDs as strings.',
    action: 'Click Run tool, then copy the generated type into your TypeScript project and refine it for your full data model.',
    output: 'An exported Root type with nested properties and array item types. One sample cannot determine every optional field or possible value.',
    exampleInput: '{"name":"Ada","active":true}', exampleOutput: 'export type Root = {\n  "name": string;\n  "active": boolean;\n};',
  } },
  'json-schema-generator': { generate: {
    input: 'Paste a representative JSON sample. Include array items to help infer their types.',
    action: 'Click Run tool, then review and adapt the schema before using it in a validator.',
    output: 'A JSON Schema draft 2020-12 document. Sample fields become required, mixed arrays use anyOf, and additional object fields are allowed.',
    exampleInput: '{"name":"Ada"}', exampleOutput: '{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{"name":{"type":"string"}},"required":["name"]}',
  } },
  'jwt-decoder': { decode: {
    input: 'Paste a three-part JWT, optionally preceded by Bearer. The example contains a placeholder signature.',
    action: 'Click Run tool to decode the header and payload. Never use this result to authorize a request.',
    output: 'Readable header and claims, signature presence, and expiry information. signatureVerified is always false; decoding does not prove authenticity.',
    exampleInput: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiRGV2RG9jayJ9.c2lnbmF0dXJl',
    exampleOutput: '"signatureVerified": false\n"claims": {"sub":"123","name":"DevDock"}\n"expiration": {"status":"not provided"}', exampleLabel: 'Example (output excerpt)',
  } },
  'url-parser': { parse: {
    input: 'Enter a complete web address starting with http:// or https://.',
    action: 'Click Run tool. The address is parsed in this tab without opening or fetching it.',
    output: 'Protocol, origin, hostname, port, path, query entries, and fragment. Repeated parameters stay separate; credentials are omitted.',
    exampleInput: 'https://example.com/search?q=dev+dock&tag=api&tag=json#results',
    exampleOutput: '"hostname": "example.com"\n"pathname": "/search"\n"query": [{"name":"q","value":"dev dock"},{"name":"tag","value":"api"},{"name":"tag","value":"json"}]\n"fragment": "results"', exampleLabel: 'Example (output excerpt)',
  } },
  'word-counter': { count: {
    input: 'Paste a sentence, paragraph, or longer text. Empty text returns zero counts.',
    action: 'Click Run tool to measure the exact text, including spaces and line breaks.',
    output: 'Word and visible-character counts, characters excluding whitespace, lines, UTF-8 bytes, and estimated reading seconds at 200 words per minute.',
    exampleInput: 'Hello world!', exampleOutput: '{"words":2,"characters":12,"charactersWithoutWhitespace":11,"lines":1,"utf8Bytes":12,"estimatedReadingSeconds":1}',
  } },
  base64: {
    encode: {
      input: 'Type or paste ordinary text. Emoji and other languages are supported.',
      action: 'Choose Encode to Base64, then click Run tool.',
      output: 'A Base64 text representation that can be decoded back to your original text.',
      exampleInput: 'Hello', exampleOutput: 'SGVsbG8=',
    },
    decode: {
      input: 'Paste Base64-encoded text, keeping any trailing = padding.',
      action: 'Choose Decode to text, then click Run tool.',
      output: 'The original readable UTF-8 text. Invalid Base64 or binary content produces an error.',
      exampleInput: 'SGVsbG8=', exampleOutput: 'Hello',
    },
  },
  'url-codec': {
    encode: {
      input: 'Enter a single URL part, such as a search term or query parameter value.',
      action: 'Choose Encode component, then click Run tool.',
      output: 'Text with special characters replaced by percent escapes, ready to use as a URL component.',
      exampleInput: 'hello world&', exampleOutput: 'hello%20world%26',
    },
    decode: {
      input: 'Paste a percent-encoded URL component.',
      action: 'Choose Decode component, then click Run tool.',
      output: 'Readable text with percent escapes decoded. Literal + signs remain unchanged.',
      exampleInput: 'hello%20world%26', exampleOutput: 'hello world&',
    },
  },
  'hash-generator': {
    sha256: {
      input: 'Enter the exact text you want to hash. Spaces, line breaks, and letter case matter.',
      action: 'Click Run tool, then use Copy result to copy the digest.',
      output: 'A 64-character hexadecimal SHA-256 digest. Identical input gives the same digest; hashing cannot recover the original text.',
      exampleInput: 'hello', exampleOutput: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    },
  },
  'uuid-generator': {
    v4: {
      input: 'Enter how many identifiers you need: a whole number from 1 to 100.',
      action: 'Click Run tool to generate a batch, then Copy result to copy the list.',
      output: 'One random UUID v4 per line. Your identifiers will differ from this example and on each run.',
      exampleInput: '2', exampleOutput: '550e8400-e29b-41d4-a716-446655440000\n6ba7b810-9dad-41d1-80b4-00c04fd430c8',
    },
  },
  'unix-timestamp': {
    seconds: {
      input: 'Enter seconds since 1 January 1970. Up to three decimal places are supported.',
      action: 'Choose Unix seconds → UTC, then click Run tool.',
      output: 'A UTC date and time in ISO format. The ending Z means UTC, not your local timezone.',
      exampleInput: '1704067200', exampleOutput: '2024-01-01T00:00:00.000Z',
    },
    milliseconds: {
      input: 'Enter a whole number of milliseconds since 1 January 1970.',
      action: 'Choose Unix milliseconds → UTC, then click Run tool.',
      output: 'A UTC date and time in ISO format, including milliseconds.',
      exampleInput: '1704067200123', exampleOutput: '2024-01-01T00:00:00.123Z',
    },
    iso: {
      input: 'Enter a UTC date as YYYY-MM-DDTHH:mm:ssZ. You can include up to three fractional-second digits.',
      action: 'Choose UTC date → Unix seconds, then click Run tool.',
      output: 'Seconds since 1 January 1970, with a decimal fraction if the input includes milliseconds.',
      exampleInput: '2024-01-01T00:00:00Z', exampleOutput: '1704067200',
    },
  },
  'case-converter': Object.fromEntries([
    ['camel', 'camelCase', 'helloFromDevDock', 'Words joined together, with the first word lowercase and each following word capitalized.'],
    ['snake', 'snake_case', 'hello_from_dev_dock', 'Lowercase words separated by underscores.'],
    ['kebab', 'kebab-case', 'hello-from-dev-dock', 'Lowercase words separated by hyphens.'],
    ['upper', 'UPPERCASE', 'HELLO FROM DEV DOCK', 'Text in uppercase, with spaces and punctuation preserved.'],
    ['lower', 'lowercase', 'hello from dev dock', 'Text in lowercase, with spaces and punctuation preserved.'],
  ].map(([mode, label, exampleOutput, output]) => [mode, {
    input: 'Type or paste a phrase or an existing identifier, such as words in camelCase.',
    action: `Choose ${label}, then click Run tool.`,
    output,
    exampleInput: 'Hello from Dev Dock',
    exampleOutput,
  }])),
};

for (const bits of [384, 512]) {
  UTILITY_GUIDES['hash-generator']['sha' + bits] = { ...UTILITY_GUIDES['hash-generator']['sha256'], output: `A ${bits / 4}-character lowercase hexadecimal SHA-${bits} digest of your exact UTF-8 input.`, exampleOutput: bits === 384 ? "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f" : "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043", exampleInput: 'hello' };
}
