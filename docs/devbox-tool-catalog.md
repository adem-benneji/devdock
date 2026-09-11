# DevTools tool catalog

For the newly extracted PureDevKit tools, open the [PureDevKit spreadsheet-style checklist](puredevkit-tool-catalog.md) or its [CSV spreadsheet](puredevkit-tool-catalog.csv). It includes tool names, keywords, descriptions, source links, and progress fields for all 114 entries.

Extracted on September 11, 2026 from the public [DevBox app](https://app.dev-box.app/) and its [application catalog bundle](https://app.dev-box.app/__mint__/index.js).

**Inventory:** 105 utility tools, 20 cheat sheets, and 25 icon/illustration libraries (150 registered catalog entries total).

## How to use this checklist

Mark `Done` with `[x]` when a tool is implemented and tested in DevTools. Markdown table markers are editable text, not clickable checkboxes. Use the `Notes` column for an implementation issue, endpoint, frontend route, library choice, or follow-up task. Keep the original identifier when you create the tool route so links and bookmarks remain predictable.

Suggested workflow:

1. Pick a category or a `High` priority candidate.
2. Implement the smallest useful version locally in the browser where possible.
3. Add the route and implementation details to `Notes`.
4. Test the tool with valid, invalid, and boundary inputs.
5. Change `[ ]` to `[x]` only after the implementation is working.

Names, identifiers, and tags come from the public catalog. Section groupings are editorial; tools appear once even when they have multiple tags. Links use the app’s `/tools/{identifier}` route convention. Registration was verified in the bundle; individual tool execution and account availability were not tested.

This document contains only the catalog. Cheat sheets and asset libraries are listed separately from the 105 utility tools.

## Contents

- [Encoding and decoding](#encoding-and-decoding-5)
- [Structured data, markup, and code](#structured-data-markup-and-code-32)
- [Text and regular expressions](#text-and-regular-expressions-7)
- [Security, hashes, and cryptography](#security-hashes-and-cryptography-16)
- [Identifiers and sample-data generators](#identifiers-and-sample-data-generators-8)
- [CSS, colors, SVG, and fonts](#css-colors-svg-and-fonts-11)
- [Images, documents, and recording](#images-documents-and-recording-14)
- [HTTP, URLs, and device information](#http-urls-and-device-information-6)
- [Time, numbers, and units](#time-numbers-and-units-6)
- [Cheat sheets](#cheat-sheets-20)
- [Icon and illustration libraries](#icon-and-illustration-libraries-25)

## Encoding and decoding (5)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [Base58 - Encoder / Decoder](https://app.dev-box.app/tools/base58) | `base58` | encode/decode | |
| [ ] | [Base64 - Encoder / Decoder](https://app.dev-box.app/tools/base64) | `base64` | encode/decode | |
| [ ] | [Data URL Generator](https://app.dev-box.app/tools/data-url-generator) | `data-url-generator` | data-url, generators | |
| [ ] | [HTML Entities - Encoder / Decoder](https://app.dev-box.app/tools/html-entities) | `html-entities` | html, encode/decode | |
| [ ] | [URI Encoder / Decoder](https://app.dev-box.app/tools/uri-encode-decode) | `uri-encode-decode` | uri, encode/decode | |

## Structured data, markup, and code (32)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [CSV Preview](https://app.dev-box.app/tools/csv-preview) | `csv-preview` | csv | |
| [ ] | [CSV to JSON](https://app.dev-box.app/tools/csv-to-json) | `csv-to-json` | css, json, converters | |
| [ ] | [GraphQL Formatter](https://app.dev-box.app/tools/graphql-formatter) | `graphql-formatter` | graphql, formatters | |
| [ ] | [Haml To HTML](https://app.dev-box.app/tools/haml-to-html) | `haml-to-html` | haml, html, converters | |
| [ ] | [HTML Formatter](https://app.dev-box.app/tools/html-formatter) | `html-formatter` | html, formatters | |
| [ ] | [HTML Preview](https://app.dev-box.app/tools/html-preview) | `html-preview` | html, preview | |
| [ ] | [HTML To Markdown](https://app.dev-box.app/tools/html-to-markdown) | `html-to-markdown` | html, markdown, converters | |
| [ ] | [HTML To Text](https://app.dev-box.app/tools/html-to-text) | `html-to-text` | html, text, converters | |
| [ ] | [HTML Validator](https://app.dev-box.app/tools/html-validator) | `html-validator` | html, validators | |
| [ ] | [JavaScript Formatter](https://app.dev-box.app/tools/javascript-formatter) | `javascript-formatter` | javascript, formatters | |
| [ ] | [JavaScript Minifier](https://app.dev-box.app/tools/javascript-minifier) | `javascript-minifier` | javascript, minifiers | |
| [ ] | [JavaScript Validator](https://app.dev-box.app/tools/javascript-validator) | `javascript-validator` | javascript, validators | |
| [ ] | [JSON Explorer](https://app.dev-box.app/tools/json-explorer) | `json-explorer` | json, viewers | |
| [ ] | [JSON Formatter](https://app.dev-box.app/tools/json-formatter) | `json-formatter` | json, formatters | |
| [ ] | [JSON Minifier](https://app.dev-box.app/tools/json-minifier) | `json-minifier` | json, minifiers | |
| [ ] | [JSON Size Explorer](https://app.dev-box.app/tools/json-size-explorer) | `json-size-explorer` | json | |
| [ ] | [JSON String Extractor](https://app.dev-box.app/tools/json-string-extractor) | `json-string-extractor` | json, text, extractors | |
| [ ] | [JSON to CSV](https://app.dev-box.app/tools/json-to-csv) | `json-to-csv` | json, csv, converters | |
| [ ] | [JSON to TOML](https://app.dev-box.app/tools/json-to-toml) | `json-to-toml` | toml, json, converters | |
| [ ] | [JSON to YAML](https://app.dev-box.app/tools/json-to-yaml) | `json-to-yaml` | yaml, json, converters | |
| [ ] | [JSON Viewer](https://app.dev-box.app/tools/json-viewer) | `json-viewer` | json, viewers | |
| [ ] | [Keycode Info](https://app.dev-box.app/tools/keycode-info) | `keycode-info` | javascript | |
| [ ] | [Markdown Preview](https://app.dev-box.app/tools/markdown-preview) | `markdown-preview` | markdown, preview | |
| [ ] | [Markdown To HTML](https://app.dev-box.app/tools/markdown-to-html) | `markdown-to-html` | markdown, html, converters | |
| [ ] | [SQL Formatter](https://app.dev-box.app/tools/sql-formatter) | `sql-formatter` | sql, formatters | |
| [ ] | [TOML Formatter](https://app.dev-box.app/tools/toml-formatter) | `toml-formatter` | toml, formatters | |
| [ ] | [TOML to JSON](https://app.dev-box.app/tools/toml-to-json) | `toml-to-json` | json, toml | |
| [ ] | [TOML to YAML](https://app.dev-box.app/tools/toml-to-yaml) | `toml-to-yaml` | yaml, toml | |
| [ ] | [XML Formatter](https://app.dev-box.app/tools/xml-formatter) | `xml-formatter` | xml, formatters | |
| [ ] | [YAML Formatter](https://app.dev-box.app/tools/yaml-formatter) | `yaml-formatter` | yaml, formatters | |
| [ ] | [YAML to JSON](https://app.dev-box.app/tools/yaml-to-json) | `yaml-to-json` | yaml, json, converters | |
| [ ] | [YAML to TOML](https://app.dev-box.app/tools/yaml-to-toml) | `yaml-to-toml` | yaml, toml | |

## Text and regular expressions (7)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [ASCII Art Text Generator](https://app.dev-box.app/tools/ascii-text-generator) | `ascii-text-generator` | generators, text | |
| [ ] | [RegExp Tester](https://app.dev-box.app/tools/regexp-tester) | `regexp-tester` | regular-expression | |
| [ ] | [String Case Converter](https://app.dev-box.app/tools/string-case-converter) | `string-case-converter` | string, converters | |
| [ ] | [String Inspector](https://app.dev-box.app/tools/string-inspector) | `string-inspector` | string | |
| [ ] | [String Replacer](https://app.dev-box.app/tools/string-replacer) | `string-replacer` | string | |
| [ ] | [Text Diff](https://app.dev-box.app/tools/text-diff) | `text-diff` | text | |
| [ ] | [Text Diff (Side-by-Side)](https://app.dev-box.app/tools/text-diff-side-by-side) | `text-diff-side-by-side` | text | |

## Security, hashes, and cryptography (16)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [Basic Auth Generator](https://app.dev-box.app/tools/basic-auth-generator) | `basic-auth-generator` | security | |
| [ ] | [BCrypt](https://app.dev-box.app/tools/bcrypt) | `bcrypt` | hash, security | |
| [ ] | [BIP39 Passphrase Generator](https://app.dev-box.app/tools/bip39) | `bip39` | generators, security | |
| [ ] | [Chmod Calculator](https://app.dev-box.app/tools/chmod-calculator) | `chmod-calculator` | generators, security | |
| [ ] | [Data Encryptor](https://app.dev-box.app/tools/data-encryptor) | `data-encryptor` | security | |
| [ ] | [Hash Generator](https://app.dev-box.app/tools/hash-generator) | `hash-generator` | hash, security, generators | |
| [ ] | [HMAC Generator](https://app.dev-box.app/tools/hmac-generator) | `hmac-generator` | hash, security, generators | |
| [ ] | [HTML Sanitizer](https://app.dev-box.app/tools/html-sanitizer) | `html-sanitizer` | html, security | |
| [ ] | [JWT Decoder](https://app.dev-box.app/tools/jwt-decoder) | `jwt-decoder` | jwt | |
| [ ] | [Password Generator](https://app.dev-box.app/tools/random-password-generator) | `random-password-generator` | password, generators, security | |
| [ ] | [PGP Decryptor](https://app.dev-box.app/tools/pgp-decryptor) | `pgp-decryptor` | pgp, security | |
| [ ] | [PGP Encryptor](https://app.dev-box.app/tools/pgp-encryptor) | `pgp-encryptor` | pgp, security | |
| [ ] | [PGP Key Generator](https://app.dev-box.app/tools/pgp-key-generator) | `pgp-key-generator` | pgp, generators, security | |
| [ ] | [PGP Signer](https://app.dev-box.app/tools/pgp-signer) | `pgp-signer` | pgp, security | |
| [ ] | [PGP Verifier](https://app.dev-box.app/tools/pgp-verifier) | `pgp-verifier` | pgp, security | |
| [ ] | [RSA Key Pair Generator](https://app.dev-box.app/tools/rsa-key-pair-generator) | `rsa-key-pair-generator` | security, generators | |

## Identifiers and sample-data generators (8)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [Barcode Generator](https://app.dev-box.app/tools/barcode-generator) | `barcode-generator` | barcode, generators | |
| [ ] | [Faker](https://app.dev-box.app/tools/faker) | `faker` | generators | |
| [ ] | [Lorem Ipsum Generator](https://app.dev-box.app/tools/lorem-ipsum) | `lorem-ipsum` | generators | |
| [ ] | [QR Code Generator](https://app.dev-box.app/tools/qrcode-generator) | `qrcode-generator` | qr-code, generators | |
| [ ] | [Structured Data Generator](https://app.dev-box.app/tools/structured-data-generator) | `structured-data-generator` | data, generators | |
| [ ] | [SVG Extractor](https://app.dev-box.app/tools/svg-extractor) | `svg-extractor` | svg, extractors | |
| [ ] | [ULID](https://app.dev-box.app/tools/ulid) | `ulid` | generators | |
| [ ] | [UUID](https://app.dev-box.app/tools/uuid) | `uuid` | uuid, generators | |

## CSS, colors, SVG, and fonts (11)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [Color Contrast Calculator](https://app.dev-box.app/tools/color-contrast-calculator) | `color-contrast-calculator` | color | |
| [ ] | [Color Information](https://app.dev-box.app/tools/color-information) | `color-information` | color | |
| [ ] | [Color Palette Generator](https://app.dev-box.app/tools/color-palette-generator) | `color-palette-generator` | color, generators | |
| [ ] | [CSS Cursors](https://app.dev-box.app/tools/css-cursors) | `css-cursors` | css | |
| [ ] | [CSS Formatter](https://app.dev-box.app/tools/css-formatter) | `css-formatter` | css, formatters | |
| [ ] | [CSS Minifier](https://app.dev-box.app/tools/css-minifier) | `css-minifier` | css, minifiers | |
| [ ] | [CSS Shadow Generator](https://app.dev-box.app/tools/css-shadow-generator) | `css-shadow-generator` | css, generators | |
| [ ] | [CSS Triangle Generator](https://app.dev-box.app/tools/css-triangle-generator) | `css-triangle-generator` | css, generators | |
| [ ] | [Glyph Inspector](https://app.dev-box.app/tools/glyph-inspector) | `glyph-inspector` | font | |
| [ ] | [SVG to CSS](https://app.dev-box.app/tools/svg-to-css) | `svg-to-css` | svg, css, converters | |
| [ ] | [SVGO](https://app.dev-box.app/tools/svgo) | `svgo` | svg, minifiers | |

## Images, documents, and recording (14)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [Barcode Scanner](https://app.dev-box.app/tools/barcode-scanner) | `barcode-scanner` | barcode, scanner | |
| [ ] | [Batch Image Processor](https://app.dev-box.app/tools/batch-image-processor) | `batch-image-processor` | image | |
| [ ] | [Code Snippet to Image](https://app.dev-box.app/tools/code-snippet-to-image) | `code-snippet-to-image` | generators | |
| [ ] | [Favicon Generator](https://app.dev-box.app/tools/favicon-generator) | `favicon-generator` | image | |
| [ ] | [HTML to PDF](https://app.dev-box.app/tools/html-to-pdf) | `html-to-pdf` | html, pdf, converters | |
| [ ] | [Image Compressor](https://app.dev-box.app/tools/image-compressor) | `image-compressor` | image, compressors | |
| [ ] | [Image Cropper](https://app.dev-box.app/tools/image-cropper) | `image-cropper` | image | |
| [ ] | [Image Extractor](https://app.dev-box.app/tools/image-extractor) | `image-extractor` | image, extractors | |
| [ ] | [Image to ASCII Art](https://app.dev-box.app/tools/image-to-ascii-art) | `image-to-ascii-art` | image, generators, converters | |
| [ ] | [PDF Merger](https://app.dev-box.app/tools/pdf-merger) | `pdf-merger` | pdf | |
| [ ] | [PDF To Image](https://app.dev-box.app/tools/pdf-to-image) | `pdf-to-image` | pdf | |
| [ ] | [Placeholder Image Generator](https://app.dev-box.app/tools/placeholder-image-generator) | `placeholder-image-generator` | image, generators | |
| [ ] | [QR Code Scanner](https://app.dev-box.app/tools/qrcode-scanner) | `qrcode-scanner` | qr-code, scanner | |
| [ ] | [Screen Recorder](https://app.dev-box.app/tools/screen-recorder) | `screen-recorder` | recorders | |

## HTTP, URLs, and device information (6)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [Device Information](https://app.dev-box.app/tools/device-information) | `device-information` | device, information | |
| [ ] | [IP Information](https://app.dev-box.app/tools/ip) | `ip` | http, network | |
| [ ] | [QueryString Parser](https://app.dev-box.app/tools/querystring-parser) | `querystring-parser` | querystring, parsers | |
| [ ] | [Request Tester](https://app.dev-box.app/tools/request-tester) | `request-tester` | http | |
| [ ] | [URL Parser](https://app.dev-box.app/tools/url-parser) | `url-parser` | url, parsers | |
| [ ] | [User Agent Parser](https://app.dev-box.app/tools/user-agent-parser) | `user-agent-parser` | http, parsers | |

## Time, numbers, and units (6)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [CRON](https://app.dev-box.app/tools/cron) | `cron` | cron | |
| [ ] | [Number Base Converter](https://app.dev-box.app/tools/number-base-converter) | `number-base-converter` | number, converters | |
| [ ] | [Number Decimal Converter](https://app.dev-box.app/tools/number-decimal-converter) | `number-decimal-converter` | number, converters | |
| [ ] | [Pomodoro](https://app.dev-box.app/tools/pomodoro) | `pomodoro` | time | |
| [ ] | [Unit Converter](https://app.dev-box.app/tools/unit-converter) | `unit-converter` | unit, converters | |
| [ ] | [Unix Time Converter](https://app.dev-box.app/tools/unix-time-converter) | `unix-time-converter` | time, converters | |

## Cheat sheets (20)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [Alt Key Combinations](https://app.dev-box.app/tools/cheat-sheet-alt-codes) | `cheat-sheet-alt-codes` | codes | |
| [ ] | [Amazon Web Services (AWS) CLI](https://app.dev-box.app/tools/cheat-sheet-aws-cli) | `cheat-sheet-aws-cli` | cli | |
| [ ] | [Apt](https://app.dev-box.app/tools/cheat-sheet-apt) | `cheat-sheet-apt` | cli, package-manager | |
| [ ] | [AptGet](https://app.dev-box.app/tools/cheat-sheet-apt-get) | `cheat-sheet-apt-get` | cli, package-manager | |
| [ ] | [ASCII Codes](https://app.dev-box.app/tools/cheat-sheet-ascii-codes) | `cheat-sheet-ascii-codes` | codes | |
| [ ] | [Country Codes](https://app.dev-box.app/tools/cheat-sheet-country-codes) | `cheat-sheet-country-codes` | codes | |
| [ ] | [Curl](https://app.dev-box.app/tools/cheat-sheet-curl) | `cheat-sheet-curl` | cli, http | |
| [ ] | [Currencies](https://app.dev-box.app/tools/cheat-sheet-currency) | `cheat-sheet-currency` | codes | |
| [ ] | [Docker](https://app.dev-box.app/tools/cheat-sheet-docker) | `cheat-sheet-docker` | cli | |
| [ ] | [Git](https://app.dev-box.app/tools/cheat-sheet-git) | `cheat-sheet-git` | cli, version-control | |
| [ ] | [Homebrew](https://app.dev-box.app/tools/cheat-sheet-brew) | `cheat-sheet-brew` | cli, package-manager | |
| [ ] | [HTTP Status Codes](https://app.dev-box.app/tools/cheat-sheet-http-status-codes) | `cheat-sheet-http-status-codes` | codes, http | |
| [ ] | [NPM](https://app.dev-box.app/tools/cheat-sheet-npm) | `cheat-sheet-npm` | cli, package-manager | |
| [ ] | [Redis](https://app.dev-box.app/tools/cheat-sheet-redis) | `cheat-sheet-redis` | cli | |
| [ ] | [Regexp](https://app.dev-box.app/tools/cheat-sheet-regexp) | `cheat-sheet-regexp` | programming | |
| [ ] | [SSH](https://app.dev-box.app/tools/cheat-sheet-ssh) | `cheat-sheet-ssh` | cli, programming | |
| [ ] | [Subversion](https://app.dev-box.app/tools/cheat-sheet-svn) | `cheat-sheet-svn` | cli, version-control | |
| [ ] | [Tar](https://app.dev-box.app/tools/cheat-sheet-tar) | `cheat-sheet-tar` | cli, archive | |
| [ ] | [URL Encoding](https://app.dev-box.app/tools/cheat-sheet-url-encoding) | `cheat-sheet-url-encoding` | programming | |
| [ ] | [Yarn](https://app.dev-box.app/tools/cheat-sheet-yarn) | `cheat-sheet-yarn` | cli, package-manager | |

## Icon and illustration libraries (25)

| Done | Name | Identifier | Catalog tags | Notes |
| --- | --- | --- | --- | --- |
| [ ] | [3D Icons (Color)](https://app.dev-box.app/tools/3d-icons-color) | `3d-icons-color` | images, icon-set, png | |
| [ ] | [3D Icons (Gradient)](https://app.dev-box.app/tools/3d-icons-gradient) | `3d-icons-gradient` | images, icon-set, png | |
| [ ] | [3D Icons (Premium)](https://app.dev-box.app/tools/3d-icons-premium) | `3d-icons-premium` | images, icon-set, png | |
| [ ] | [AR/VR Icons](https://app.dev-box.app/tools/ar-vr) | `ar-vr` | images, icon-set, svg | |
| [ ] | [Basil Icons](https://app.dev-box.app/tools/basil) | `basil` | images, icon-set, svg | |
| [ ] | [Brandico](https://app.dev-box.app/tools/brandico) | `brandico` | icon-set, svg | |
| [ ] | [Browser Logos](https://app.dev-box.app/tools/browser-logos) | `browser-logos` | images, png | |
| [ ] | [Circle Flags](https://app.dev-box.app/tools/circle-flags) | `circle-flags` | icon-set, svg | |
| [ ] | [CoreUI Free](https://app.dev-box.app/tools/cli) | `cli` | images, icon-set, svg | |
| [ ] | [Devicon (Color)](https://app.dev-box.app/tools/devicon) | `devicon` | icon-set, svg | |
| [ ] | [Devicon (Line)](https://app.dev-box.app/tools/devicon-line) | `devicon-line` | icon-set, svg | |
| [ ] | [Devicon (Plain)](https://app.dev-box.app/tools/devicon-plain) | `devicon-plain` | icon-set, svg | |
| [ ] | [Feather Icons](https://app.dev-box.app/tools/feather-icons) | `feather-icons` | icon-set, svg | |
| [ ] | [Flag Icons](https://app.dev-box.app/tools/flag-icons) | `flag-icons` | images, icon-set, svg | |
| [ ] | [Flagpack](https://app.dev-box.app/tools/flagpack) | `flagpack` | images, icon-set, svg | |
| [ ] | [Font Gis](https://app.dev-box.app/tools/font-gis) | `font-gis` | images, icon-set, svg | |
| [ ] | [Geo Glyphs](https://app.dev-box.app/tools/geo-glyphs) | `geo-glyphs` | images, icon-set, svg | |
| [ ] | [Icons (Lukasz Adam)](https://app.dev-box.app/tools/lukasz-adam-icons) | `lukasz-adam-icons` | images, svg | |
| [ ] | [illlustrations.co](https://app.dev-box.app/tools/illlustrations-co) | `illlustrations-co` | images, svg | |
| [ ] | [Illustrations (Lukasz Adam)](https://app.dev-box.app/tools/lukasz-adam-illustrations) | `lukasz-adam-illustrations` | images, svg | |
| [ ] | [Office Icons](https://app.dev-box.app/tools/office-icons) | `office-icons` | images, icon-set, svg | |
| [ ] | [Solar Icons](https://app.dev-box.app/tools/solar-icons) | `solar-icons` | images, icon-set, svg | |
| [ ] | [Space Icons](https://app.dev-box.app/tools/space-icons) | `space-icons` | images, png | |
| [ ] | [SVG Spinners](https://app.dev-box.app/tools/svg-spinners) | `svg-spinners` | icon-set, svg | |
| [ ] | [Tabler Icons](https://app.dev-box.app/tools/tabler-icons) | `tabler-icons` | icon-set, svg | |

## Additional tool ideas found in the wider web

These are candidate additions discovered by comparing other developer-tool catalogs. They are intentionally kept separate from the scraped DevBox inventory above, so the source catalog remains auditable. The identifiers below are proposed DevTools slugs and are not claims that these routes exist in DevBox.

The strongest recurring gaps were OpenAPI and API workflow tools, browser-security metadata, network diagnostics, local SQL playgrounds, and AI/data cleanup utilities. Similar tools are listed by [Utilumo](https://utilumo.com/developer), [PureDevKit](https://puredevkit.com/), [FreeDevTool](https://freedevtool.org/), and [ToolDock](https://tooldock.org/).

### API design and HTTP workflow

| Done | Proposed tool | Identifier | What it should do | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | OpenAPI Viewer | `openapi-viewer` | Render an OpenAPI or Swagger document as browsable documentation. | High | |
| [ ] | OpenAPI Validator | `openapi-validator` | Validate an OpenAPI 3 document and show path, schema, and parameter errors. | High | |
| [ ] | OpenAPI Editor | `openapi-editor` | Edit an OpenAPI document with live validation and preview. | Medium | |
| [ ] | cURL Generator | `curl-generator` | Build a cURL command from method, URL, headers, query parameters, and body fields. | High | |
| [ ] | cURL to Code | `curl-to-code` | Convert cURL into JavaScript `fetch`, Axios, Python `requests`, Go, and Java clients. | High | |
| [ ] | Fetch to cURL | `fetch-to-curl` | Convert browser Fetch options into a reproducible cURL command. | Medium | |
| [ ] | HTTP Header Inspector | `http-header-inspector` | Inspect response headers and flag common security or caching issues. | High | |
| [ ] | MIME Type Lookup | `mime-type-lookup` | Look up a MIME type from an extension and an extension from a MIME type. | High | |
| [ ] | HTTP Request Timeline | `http-request-timeline` | Show DNS, connection, TLS, first-byte, and download timing for a request. | Medium | |

### JSON, data, and schema workflows

| Done | Proposed tool | Identifier | What it should do | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | JSONPath Tester | `jsonpath-tester` | Run JSONPath expressions against a document and highlight matched nodes. | High | |
| [ ] | JSON to TypeScript | `json-to-typescript` | Generate TypeScript interfaces or types from representative JSON. | High | |
| [ ] | JSON to Zod | `json-to-zod` | Generate Zod schemas from JSON examples. | Medium | |
| [ ] | JSON Schema Generator | `json-schema-generator` | Infer a JSON Schema from one or more JSON examples. | High | |
| [ ] | JSONL Validator | `jsonl-validator` | Validate newline-delimited JSON row by row and report line numbers. | Medium | |
| [ ] | JSON/XML Converter | `json-xml-converter` | Convert JSON to XML and XML to JSON with configurable root and attribute rules. | Medium | |
| [ ] | CSV Cleaner | `csv-cleaner` | Detect duplicate rows, normalize delimiters, trim fields, and identify malformed records. | Medium | |
| [ ] | XML Sitemap Generator | `xml-sitemap-generator` | Generate a sitemap from entered URLs and validate its XML structure. | Medium | |

### Security and web metadata

| Done | Proposed tool | Identifier | What it should do | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | JWT Claim Explainer | `jwt-claim-explainer` | Explain registered JWT claims and show expiry, issuer, audience, and clock status. | High | |
| [ ] | Certificate Decoder | `certificate-decoder` | Decode PEM/X.509 certificates and show subject, issuer, SANs, algorithms, and validity. | High | |
| [ ] | Security Headers Generator | `security-headers-generator` | Generate starter CSP, HSTS, Permissions-Policy, Referrer-Policy, and related headers. | High | |
| [ ] | CSP Analyzer | `csp-analyzer` | Parse a Content-Security-Policy and identify risky directives or ineffective sources. | High | |
| [ ] | Permissions Policy Generator | `permissions-policy-generator` | Build a readable Permissions-Policy header from feature selections. | Medium | |
| [ ] | security.txt Generator | `security-txt-generator` | Generate a security.txt disclosure file from contact and policy details. | Medium | |
| [ ] | robots.txt Generator | `robots-txt-generator` | Build and preview crawler rules for common bots and sitemap locations. | Medium | |
| [ ] | Open Graph Meta Generator | `opengraph-meta-generator` | Generate Open Graph, Twitter Card, and basic SEO meta tags. | Medium | |

### Networking and DevOps

| Done | Proposed tool | Identifier | What it should do | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | DNS Lookup | `dns-lookup` | Query A, AAAA, CNAME, MX, NS, TXT, and CAA records through DNS-over-HTTPS. | High | |
| [ ] | Subnet Calculator | `subnet-calculator` | Calculate CIDR ranges, usable hosts, broadcast, masks, and subnet splits. | High | |
| [ ] | IP Range Summarizer | `ip-range-summarizer` | Collapse multiple IPv4/IPv6 ranges into the smallest equivalent CIDR set. | Medium | |
| [ ] | Docker Compose to Kubernetes | `compose-to-kubernetes` | Convert a Compose file into starter Kubernetes manifests and flag unsupported options. | Medium | |
| [ ] | Environment Diff | `environment-diff` | Compare `.env` files while masking values and highlighting missing or changed keys. | High | |
| [ ] | Log Viewer and Filter | `log-viewer` | Paste logs, detect timestamps and levels, filter entries, and export a cleaned view. | Medium | |

### SQL and database learning

| Done | Proposed tool | Identifier | What it should do | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | SQLite Playground | `sqlite-playground` | Run SQLite queries locally in the browser against pasted or generated tables. | High | |
| [ ] | SQL Query Tester | `sql-query-tester` | Test queries against a small local sample dataset and explain result columns. | Medium | |
| [ ] | SQL Schema Builder | `sql-schema-builder` | Draw tables and relationships, then export PostgreSQL DDL. | High | |
| [ ] | SQL JOIN Playground | `sql-join-playground` | Teach and visualize INNER, LEFT, RIGHT, and FULL JOIN behavior with sample data. | Medium | |
| [ ] | Database URL Parser | `database-url-parser` | Parse PostgreSQL, MySQL, Redis, and MongoDB URLs with secret masking. | High | |

### Markdown, text, and AI-adjacent utilities

| Done | Proposed tool | Identifier | What it should do | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | Markdown Table Generator | `markdown-table-generator` | Turn pasted CSV or tabular text into aligned Markdown tables. | High | |
| [ ] | Markdown TOC Generator | `markdown-toc-generator` | Generate a nested table of contents from Markdown headings. | High | |
| [ ] | Word and Reading-Time Counter | `word-counter` | Count words, characters, lines, tokens estimate, and reading time. | Medium | |
| [ ] | Text Escape Playground | `text-escape-playground` | Escape and unescape JSON, JavaScript, HTML, XML, SQL, and shell strings. | High | |
| [ ] | Prompt Diff | `prompt-diff` | Compare prompt versions and highlight additions, removals, and token estimates. | Medium | |
| [ ] | AI JSON Output Validator | `ai-json-output-validator` | Validate model output against JSON Schema and show a repair-friendly error list. | Medium | |
| [ ] | Prompt Injection Scanner | `prompt-injection-scanner` | Flag common instruction-hijacking patterns in untrusted prompt content. | Medium | |

### Suggested implementation order

Start with `openapi-viewer`, `jsonpath-tester`, `json-to-typescript`, `curl-generator`, `http-header-inspector`, `dns-lookup`, `subnet-calculator`, `environment-diff`, `markdown-table-generator`, and `sqlite-playground`. They are useful across frontend, backend, and DevOps work and can mostly run locally in the browser.

For tools that make network requests—DNS, HTTP inspection, and request timing—make the privacy behavior explicit. Browser-only tools should keep input local; server-backed tools should show the destination, retention policy, and whether credentials are sent. Treat certificate decoding, JWT inspection, and security-header analysis as parsing and education features; do not imply that a decoded token is verified unless the tool actually verifies its signature.

### Sources consulted

- [Utilumo developer tools](https://utilumo.com/developer) — OpenAPI, JSON Schema/Zod generation, security headers, CSP, security.txt, robots.txt, SQL playgrounds, cURL converters, and AI-focused utilities.
- [PureDevKit](https://puredevkit.com/) — cURL-to-code, MIME lookup, HTTP tooling, JSON/YAML conversion, UUID variants, and local hash utilities.
- [FreeDevTool](https://freedevtool.org/) — bytes, checksums, meta tags, DNS lookup, subnet/network utilities, and cURL generation.
- [ToolDock](https://tooldock.org/) — broad category coverage across data, generators, text/regex, network/security, and CSS/design tools.
- [DevToolGrid](https://devtoolgrid.com/) — JSONPath, MIME, HTTP headers, and timestamp utility concepts.
