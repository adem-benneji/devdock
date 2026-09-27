import { computed, Injectable, signal } from '@angular/core';
export interface Tool { id: string; name: string; description: string; category: string; icon: string; color: string; tags: string[]; local: boolean; badge?: string; }
export const CATEGORIES = [
  { id: 'data', name: 'Data & formats', icon: 'braces', description: 'Make sense of your payloads.', color: 'green' },
  { id: 'security', name: 'Security', icon: 'shield', description: 'Digests without the detour.', color: 'purple' },
  { id: 'web', name: 'Web & URLs', icon: 'link', description: 'A little help for the web.', color: 'blue' },
  { id: 'generate', name: 'Generators', icon: 'spark', description: 'Fresh identifiers, on demand.', color: 'orange' },
  { id: 'time', name: 'Date & time', icon: 'clock', description: 'Time that makes human sense.', color: 'pink' },
  { id: 'text', name: 'Text', icon: 'text', description: 'Get your words into shape.', color: 'teal' },
];
export const TOOLS: Tool[] = [
  { id: 'file-converter', name: 'File Converter', description: 'Drop a file, discover compatible formats, and download a real conversion.', category: 'data', icon: 'copy', color: 'green', tags: ['file', 'convert', 'pdf', 'docx', 'image', 'spreadsheet', 'archive', 'xlsx'], local: false, badge: 'Local file processing' },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Bring structure to the chaos. Format, validate, and minify your JSON.', category: 'data', icon: 'braces', color: 'green', tags: ['json', 'format', 'validate', 'minify'], local: false },
  { id: 'base64', name: 'Base64 Encoder', description: 'Encode and decode text, with full support for Unicode.', category: 'data', icon: 'code', color: 'blue', tags: ['base64', 'encode', 'decode', 'unicode'], local: true },
  { id: 'hash-generator', name: 'SHA Hash Generator', description: 'Turn text into a SHA-256, SHA-384, or SHA-512 digest. Every character counts.', category: 'security', icon: 'shield', color: 'purple', tags: ['hash', 'sha256', 'sha-256', 'sha384', 'sha512', 'checksum'], local: true },
  { id: 'uuid-generator', name: 'UUID Generator', description: 'A fresh batch of random v4 UUIDs, ready for your next project.', category: 'generate', icon: 'hash', color: 'orange', tags: ['uuid', 'v4', 'random', 'id', 'generate'], local: true },
  { id: 'unix-timestamp', name: 'Unix Timestamp', description: 'Go from epoch to everyday. Convert timestamps and UTC dates.', category: 'time', icon: 'clock', color: 'pink', tags: ['unix', 'timestamp', 'epoch', 'date', 'utc'], local: true },
  { id: 'url-codec', name: 'URL Encoder', description: 'Encode a URL component or decode those percent signs.', category: 'web', icon: 'link', color: 'teal', tags: ['url', 'uri', 'encode', 'decode', 'percent'], local: true },
  { id: 'case-converter', name: 'Case Converter', description: 'Switch between camelCase, snake_case, kebab-case, and more.', category: 'text', icon: 'text', color: 'green', tags: ['text', 'case', 'camel', 'snake', 'kebab', 'uppercase'], local: true },
  { id: 'jsonpath-tester', name: 'JSONPath Tester', description: 'Find the nodes you need. Query JSON with paths, wildcards, and slices.', category: 'data', icon: 'braces', color: 'green', tags: ['json', 'jsonpath', 'query', 'filter', 'extract'], local: true },
  { id: 'json-to-typescript', name: 'JSON to TypeScript', description: 'Turn a sample payload into a useful TypeScript starting point.', category: 'data', icon: 'code', color: 'blue', tags: ['json', 'typescript', 'types', 'convert'], local: true },
  { id: 'json-schema-generator', name: 'JSON Schema Generator', description: 'Infer a JSON Schema from your sample data, ready to refine.', category: 'data', icon: 'braces', color: 'orange', tags: ['json', 'schema', 'generate'], local: true },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Inspect token headers, claims, and expiration. Decoding only.', category: 'security', icon: 'shield', color: 'purple', tags: ['jwt', 'token', 'decode', 'claims', 'expiry'], local: true },
  { id: 'url-parser', name: 'URL Parser', description: 'Break a web address into its path, query parameters, and fragment.', category: 'web', icon: 'link', color: 'teal', tags: ['url', 'parse', 'query', 'parameters'], local: true },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, lines, and estimated reading time.', category: 'text', icon: 'text', color: 'pink', tags: ['text', 'word', 'count', 'reading', 'characters'], local: true },
  { id: 'csv-json', name: 'CSV ↔ JSON', description: 'Move between spreadsheet rows and JSON records with clear column rules.', category: 'data', icon: 'braces', color: 'green', tags: ['csv', 'json', 'convert', 'table', 'spreadsheet'], local: true },
  { id: 'yaml-json', name: 'YAML ↔ JSON', description: 'Convert configuration data between YAML and JSON, right in your browser.', category: 'data', icon: 'code', color: 'blue', tags: ['yaml', 'json', 'convert', 'config'], local: true },
  { id: 'markdown-table', name: 'Markdown Table Generator', description: 'Turn CSV rows into a table for your README or documentation.', category: 'text', icon: 'text', color: 'teal', tags: ['markdown', 'csv', 'table', 'readme', 'generate'], local: true },
  { id: 'line-toolkit', name: 'Line Toolkit', description: 'Deduplicate, sort, reverse, trim, and clean up your lists.', category: 'text', icon: 'text', color: 'pink', tags: ['lines', 'deduplicate', 'sort', 'reverse', 'trim'], local: true },
  { id: 'number-base-converter', name: 'Number Base Converter', description: 'Convert integers between decimal, hexadecimal, binary, and octal.', category: 'data', icon: 'hash', color: 'orange', tags: ['number', 'base', 'binary', 'hex', 'decimal', 'octal', 'radix'], local: true },
  {"id": "regex-tester", "name": "Regex Tester", "description": "Find matches, inspect capture groups, and try replacements.", "category": "text", "icon": "code", "color": "purple", "tags": ["regex", "regexp", "match", "replace"], "local": true},
  {"id": "json-diff", "name": "JSON Diff", "description": "Compare structured documents and pinpoint changed values.", "category": "data", "icon": "braces", "color": "green", "tags": ["json", "diff", "compare"], "local": true},
  {"id": "text-diff", "name": "Text Diff", "description": "See added, removed, and unchanged lines between two versions.", "category": "text", "icon": "text", "color": "blue", "tags": ["text", "diff", "compare", "lines"], "local": true},
  {"id": "json-lines", "name": "JSON Lines", "description": "Move between newline-delimited JSON and ordinary arrays.", "category": "data", "icon": "braces", "color": "orange", "tags": ["jsonl", "ndjson", "json", "lines"], "local": true},
  {"id": "json-flatten", "name": "JSON Flatten", "description": "Flatten JSON into reversible paths without losing array types.", "category": "data", "icon": "braces", "color": "teal", "tags": ["json", "flatten", "unflatten", "paths"], "local": true},
  {"id": "html-entities", "name": "HTML Entities", "description": "Encode special characters or decode named and numeric entities.", "category": "web", "icon": "code", "color": "blue", "tags": ["html", "entities", "encode", "decode", "escape"], "local": true},
  {"id": "json-string", "name": "JSON String Escape", "description": "Turn text into a quoted JSON string, or recover the original.", "category": "data", "icon": "code", "color": "pink", "tags": ["json", "string", "escape", "unescape"], "local": true},
  {"id": "text-hex", "name": "UTF-8 Hex Converter", "description": "Explore text as hex bytes and decode UTF-8 byte sequences.", "category": "data", "icon": "hash", "color": "orange", "tags": ["hex", "utf8", "bytes", "text", "decode"], "local": true},
  {"id": "unicode-inspector", "name": "Unicode Inspector", "description": "Inspect characters, code points, bytes, and normalization forms.", "category": "text", "icon": "text", "color": "purple", "tags": ["unicode", "utf8", "codepoints", "normalize"], "local": true},
  {"id": "line-endings", "name": "Line Endings", "description": "Inspect and convert newline styles or remove a leading BOM.", "category": "text", "icon": "text", "color": "teal", "tags": ["lf", "crlf", "cr", "bom", "lines"], "local": true},
  {"id": "password-generator", "name": "Password Generator", "description": "Create a random password using browser cryptographic randomness.", "category": "generate", "icon": "shield", "color": "green", "tags": ["password", "random", "generate", "security"], "local": true},
  {"id": "slug-generator", "name": "Slug Generator", "description": "Turn a title into a clean, Unicode-friendly URL slug.", "category": "web", "icon": "link", "color": "pink", "tags": ["slug", "url", "accents", "text"], "local": true},
  {"id": "json-schema-validator", "name": "JSON Schema Validator", "category": "data", "description": "Check JSON against a schema and locate validation errors.", "icon": "braces", "color": "green", "tags": ["json", "schema", "validator", "json schema validator"], "local": true},
  {"id": "sql-formatter", "name": "SQL Formatter", "category": "data", "description": "Format SQL for PostgreSQL, MySQL, SQLite, SQL Server, or standard SQL.", "icon": "braces", "color": "green", "tags": ["sql", "formatter", "sql formatter"], "local": true},
  {"id": "semver-tool", "name": "Semantic Version Toolkit", "category": "generate", "description": "Inspect, increment, compare, and match semantic versions.", "icon": "hash", "color": "orange", "tags": ["semver", "tool", "semantic version toolkit"], "local": true},
  {"id": "hmac-signer", "name": "HMAC Signer", "category": "security", "description": "Sign UTF-8 messages and verify hexadecimal HMAC signatures.", "icon": "shield", "color": "purple", "tags": ["hmac", "signer", "hmac signer"], "local": true},
  {"id": "pkce-generator", "name": "PKCE Generator", "category": "security", "description": "Generate OAuth PKCE verifiers and derive S256 challenges.", "icon": "shield", "color": "purple", "tags": ["pkce", "generator", "pkce generator"], "local": true},
  {"id": "ipv4-cidr", "name": "IPv4 CIDR Calculator", "category": "web", "description": "Inspect subnet boundaries and check address membership.", "icon": "link", "color": "blue", "tags": ["ipv4", "cidr", "ipv4 cidr calculator"], "local": true},
  {"id": "url-query-editor", "name": "URL Query Editor", "category": "web", "description": "Edit repeated query parameters or remove common tracking keys.", "icon": "link", "color": "blue", "tags": ["url", "query", "editor", "url query editor"], "local": true},
  {"id": "gzip-deflate", "name": "Gzip / Deflate", "category": "data", "description": "Compress text to Base64 or restore compressed UTF-8 data.", "icon": "braces", "color": "green", "tags": ["gzip", "deflate", "gzip / deflate"], "local": true},

];
@Injectable({ providedIn: 'root' })
export class ToolCatalog {
  readonly tools = TOOLS;
  readonly categories = CATEGORIES;
  readonly favorites = signal<string[]>(this.read());
  readonly favoriteCount = computed(() => this.favorites().length);
  toggle(id: string) {
    const next = this.favorites().includes(id) ? this.favorites().filter(value => value !== id) : [...this.favorites(), id];
    this.favorites.set(next);
    try { localStorage.setItem('devdock.favorites', JSON.stringify(next)); } catch { /* Usable even if browser storage is disabled. */ }
  }
  private read(): string[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem('devdock.favorites') ?? '[]');
      return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && TOOLS.some(tool => tool.id === id)))] : [];
    } catch { return []; }
  }
}
