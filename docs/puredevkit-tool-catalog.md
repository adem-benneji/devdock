# DevTools — PureDevKit tool checklist

114 tools extracted from the live [PureDevKit catalog](https://puredevkit.com/tools/) on September 11, 2026. Each tool name links to its source page. Descriptions are concise paraphrases; names are expanded where needed for clarity, and keywords are editorial search terms.

This is an implementation checklist for DevTools. A catalog listing does not mean the feature has been built here. Some entries overlap with the [existing DevBox and candidate checklist](devbox-tool-catalog.md); these 114 entries are not all new, unique project features. Tool execution was not tested.

## Use as a spreadsheet

Open [puredevkit-tool-catalog.csv](puredevkit-tool-catalog.csv) in Excel or import it into Google Sheets to sort, filter, and track work.

| Column | How to use it |
| --- | --- |
| Done | Change `[ ]` to `[x]` after implementation and testing. These are editable text markers, not clickable Markdown checkboxes. |
| ID | Stable reference for issues and discussions. |
| Tool name | Readable feature name; click it to inspect the reference tool. |
| Keywords | Search terms for finding related tools. |
| Description | The main capability to implement. |
| Notes | Your decisions, issue links, or remaining work. |

Markdown and CSV are snapshots; edits in one do not automatically update the other. The CSV also includes category, original source name, source slug, and source URL.

## Category index

| Category | Tools |
| --- | ---: |
| [Data, formats, and files](#data) | 23 |
| [Security, tokens, and signing](#security) | 15 |
| [HTTP, networking, and web configuration](#http) | 23 |
| [Text, code, and localization](#text) | 21 |
| [Dates, time, and schedules](#time) | 7 |
| [Generators and test fixtures](#generate) | 15 |
| [Images, icons, and design](#images) | 9 |
| [File sharing](#files) | 1 |
| **Total** | **114** |

<a id="data"></a>

## Data, formats, and files

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-022 | [Base32 / 58 / 85](https://puredevkit.com/tools/base-encoder/) | base32, base58, ascii85 | Transform content with alternative base encodings. | |
| [ ] | PDK-008 | [Base64 Studio](https://puredevkit.com/tools/base64-converter/) | base64, encode, files | Transform text or file content using Base64. | |
| [ ] | PDK-048 | [Connection String Parser](https://puredevkit.com/tools/connection-string/) | database, connection-string, parser | Inspect connection URLs without opening database connections. | |
| [ ] | PDK-013 | [CSV / JSON Converter](https://puredevkit.com/tools/csv-converter/) | csv, json, insert | Reshape CSV records and generate SQL inserts. | |
| [ ] | PDK-063 | [DynamoDB JSON](https://puredevkit.com/tools/dynamodb-json/) | dynamodb, attributevalue, json | Translate DynamoDB attribute maps to ordinary JSON. | |
| [ ] | PDK-019 | [Environment File / JSON Converter](https://puredevkit.com/tools/env-converter/) | dotenv, json, config | Convert environment-variable files to structured JSON. | |
| [ ] | PDK-062 | [GraphQL](https://puredevkit.com/tools/graphql-formatter/) | graphql, format, fetch | Format operations and prepare request snippets. | |
| [ ] | PDK-107 | [Gzip / Deflate Toolkit](https://puredevkit.com/tools/gzip-tools/) | gzip, deflate, compression | Compress byte content or recover compressed data. | |
| [ ] | PDK-065 | [Hex dump](https://puredevkit.com/tools/hex-dump/) | hex, binary, utf8 | Inspect bytes in hexadecimal or decode hexadecimal text. | |
| [ ] | PDK-018 | [HTML ↔ MD](https://puredevkit.com/tools/html-markdown/) | html, markdown, convert | Translate markup between HTML and Markdown. | |
| [ ] | PDK-061 | [INI / Properties / JSON5 Converter](https://puredevkit.com/tools/ini-converter/) | ini, properties, json5 | Translate common configuration-file syntaxes. | |
| [ ] | PDK-016 | [JSON Diff](https://puredevkit.com/tools/json-diff/) | json, compare, merge | Compare structured documents and combine objects. | |
| [ ] | PDK-014 | [JSON Flatten](https://puredevkit.com/tools/json-flatten/) | json, flatten, jsonpath | Expand or flatten objects and select nested values. | |
| [ ] | PDK-001 | [JSON Formatter](https://puredevkit.com/tools/json-formatter/) | json, format, validate | Reformat JSON and check its syntax. | |
| [ ] | PDK-015 | [JSON Schema Validator / Generator](https://puredevkit.com/tools/json-schema/) | json-schema, validation, inference | Check documents against schemas or infer a schema. | |
| [ ] | PDK-002 | [JSON to TypeScript / Zod](https://puredevkit.com/tools/json-to-typescript/) | typescript, zod, schema | Derive types or schemas from JSON examples. | |
| [ ] | PDK-017 | [JSONL Toolkit](https://puredevkit.com/tools/jsonl-converter/) | jsonl, ndjson, sampling | Reorganize and sample line-delimited JSON records. | |
| [ ] | PDK-007 | [SQL Formatter](https://puredevkit.com/tools/sql-formatter/) | sql, postgres, mysql | Reindent queries for several SQL dialects. | |
| [ ] | PDK-047 | [SQL INSERT / COPY Generator](https://puredevkit.com/tools/sql-insert/) | sql, insert, postgres-copy | Turn structured rows into database import statements. | |
| [ ] | PDK-020 | [Table Converter](https://puredevkit.com/tools/table-converter/) | tables, csv, markdown | Switch tabular content between markup and CSV. | |
| [ ] | PDK-012 | [XML to JSON / XPath](https://puredevkit.com/tools/xml-converter/) | xml, json, xpath | Transform XML data and evaluate XPath expressions. | |
| [ ] | PDK-011 | [YAML / JSON / TOML Converter](https://puredevkit.com/tools/yaml-converter/) | yaml, toml, json | Move data between three configuration formats. | |
| [ ] | PDK-060 | [ZIP Toolkit](https://puredevkit.com/tools/zip-tools/) | zip, archive, files | Create archives or inspect their file listings. | |

<a id="security"></a>

## Security, tokens, and signing

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-023 | [AES-GCM](https://puredevkit.com/tools/aes-gcm/) | aes, encryption, pbkdf2 | Encrypt data and recover it with AES-GCM. | |
| [ ] | PDK-079 | [AWS SigV4](https://puredevkit.com/tools/aws-sigv4/) | aws, sigv4, hmac | Construct AWS signing inputs without contacting AWS. | |
| [ ] | PDK-027 | [Check Digit Validator](https://puredevkit.com/tools/check-digit/) | luhn, isbn, check-digit | Check identifiers using checksum rules. | |
| [ ] | PDK-030 | [CRC32](https://puredevkit.com/tools/crc-checksum/) | crc32, checksum, files | Compute CRC checksums for supplied content. | |
| [ ] | PDK-009 | [Hash Generator](https://puredevkit.com/tools/hash-generator/) | hash, sha256, hmac | Calculate digests for text and files. | |
| [ ] | PDK-003 | [JWT Debugger](https://puredevkit.com/tools/jwt-debugger/) | jwt, claims, expiry | Inspect token sections and expiration. | |
| [ ] | PDK-025 | [JWT Generator](https://puredevkit.com/tools/jwt-generator/) | jwt, hs256, signing | Create signed tokens from supplied claims. | |
| [ ] | PDK-026 | [Passphrase](https://puredevkit.com/tools/passphrase-generator/) | passphrase, words, random | Build random multiword secrets. | |
| [ ] | PDK-068 | [Password Hash / KDF Toolkit](https://puredevkit.com/tools/pbkdf2-password/) | pbkdf2, bcrypt, htpasswd | Derive password hashes using supported schemes. | |
| [ ] | PDK-067 | [PEM / JWK](https://puredevkit.com/tools/pem-jwk/) | pem, jwk, ssh | Convert key representations and export RSA SSH material. | |
| [ ] | PDK-029 | [PKCE / OAuth](https://puredevkit.com/tools/pkce-builder/) | oauth, pkce, s256 | Prepare authorization parameters without exchanging tokens. | |
| [ ] | PDK-066 | [RSA / ECDSA](https://puredevkit.com/tools/rsa-keys/) | rsa, ecdsa, signatures | Create asymmetric keys and sign supplied content. | |
| [ ] | PDK-028 | [Secret Redactor](https://puredevkit.com/tools/secret-redactor/) | redaction, secrets, masking | Hide common credential patterns in pasted text. | |
| [ ] | PDK-024 | [TOTP / HOTP Generator](https://puredevkit.com/tools/totp-generator/) | totp, hotp, otp | Prepare one-time-password codes and setup URIs. | |
| [ ] | PDK-035 | [Webhook HMAC](https://puredevkit.com/tools/webhook-signer/) | webhook, hmac, signatures | Create or check signatures for webhook payloads. | |

<a id="http"></a>

## HTTP, networking, and web configuration

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-073 | [Authorization Header Builder](https://puredevkit.com/tools/auth-headers/) | authorization, basic, bearer | Prepare authorization headers and a Digest example. | |
| [ ] | PDK-078 | [Cloudflare Pages Configuration](https://puredevkit.com/tools/cloudflare-headers/) | cloudflare, headers, redirects | Prepare Pages header and redirect configuration. | |
| [ ] | PDK-069 | [Code → cURL](https://puredevkit.com/tools/code-to-curl/) | fetch, axios, curl | Translate supported client snippets into cURL requests. | |
| [ ] | PDK-034 | [Cookie builder](https://puredevkit.com/tools/cookie-builder/) | cookies, cache-control, headers | Assemble cookie and caching header values. | |
| [ ] | PDK-033 | [CORS Simulator](https://puredevkit.com/tools/cors-simulator/) | cors, origin, preflight | Model whether a cross-origin request is allowed. | |
| [ ] | PDK-071 | [CSP Generator](https://puredevkit.com/tools/csp-generator/) | csp, isolation, headers | Compose browser content restrictions and isolation headers. | |
| [ ] | PDK-004 | [cURL → Code](https://puredevkit.com/tools/curl-to-code/) | curl, fetch, axios | Translate cURL requests into client code. | |
| [ ] | PDK-108 | [Deep links](https://puredevkit.com/tools/deep-link/) | intent, deep-link, schemes | Compose mobile launch links and associated configuration. | |
| [ ] | PDK-075 | [DNS Record Builder](https://puredevkit.com/tools/dns-builder/) | dns, records, zone | Draft record values without performing DNS queries. | |
| [ ] | PDK-072 | [HTTP Request Composer](https://puredevkit.com/tools/http-composer/) | http, request, composer | Draft request messages without transmitting them. | |
| [ ] | PDK-032 | [HTTP Status Reference](https://puredevkit.com/tools/http-status/) | status, headers, reference | Browse response-code and header information. | |
| [ ] | PDK-106 | [IPv4 CIDR Calculator](https://puredevkit.com/tools/cidr-calculator/) | ipv4, cidr, subnet | Calculate address ranges and subnet membership. | |
| [ ] | PDK-103 | [Meta tags](https://puredevkit.com/tools/meta-tags/) | seo, opengraph, jsonld | Draft page metadata and social-sharing tags. | |
| [ ] | PDK-036 | [MIME Type Detector](https://puredevkit.com/tools/mime-detect/) | mime, bytes, file-type | Infer file types from binary signatures. | |
| [ ] | PDK-077 | [Mobile App Association Builder](https://puredevkit.com/tools/assetlinks/) | aasa, assetlinks, mobile | Build website-to-app association configuration files. | |
| [ ] | PDK-064 | [OpenAPI Request Snippets](https://puredevkit.com/tools/openapi-snippets/) | openapi, curl, fetch | Generate request examples from an API specification. | |
| [ ] | PDK-074 | [Rate Limit Header Parser](https://puredevkit.com/tools/rate-limit-parser/) | retry-after, rate-limit, headers | Interpret throttling metadata and retry timing. | |
| [ ] | PDK-070 | [Raw HTTP Parser](https://puredevkit.com/tools/raw-http/) | raw-http, parser, fetch | Interpret HTTP messages and produce request code. | |
| [ ] | PDK-037 | [robots.txt](https://puredevkit.com/tools/robots-txt/) | robots, sitemap, security-txt | Prepare crawler and disclosure-file templates. | |
| [ ] | PDK-076 | [SPF / DMARC Builder](https://puredevkit.com/tools/spf-dmarc/) | spf, dmarc, dkim | Prepare email-policy records and a DKIM stub. | |
| [ ] | PDK-031 | [URL Toolkit](https://puredevkit.com/tools/url-tools/) | url, utm, slug | Inspect URL components and edit tracking parameters. | |
| [ ] | PDK-038 | [User-Agent Parser](https://puredevkit.com/tools/user-agent/) | user-agent, browser, device | Interpret client software and device identifiers. | |
| [ ] | PDK-105 | [Web App Manifest Builder](https://puredevkit.com/tools/pwa-manifest/) | pwa, manifest, icons | Prepare installation metadata for a web application. | |

<a id="text"></a>

## Text, code, and localization

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-084 | [ANSI HTML](https://puredevkit.com/tools/ansi-html/) | ansi, terminal, html | Render terminal color sequences as HTML. | |
| [ ] | PDK-039 | [Case converter](https://puredevkit.com/tools/case-converter/) | case, slug, accents | Change naming conventions and normalize accents. | |
| [ ] | PDK-086 | [Conventional Commit Builder](https://puredevkit.com/tools/conventional-commit/) | git, commits, conventional | Compose commit messages with structured metadata. | |
| [ ] | PDK-104 | [CSS Units / Typography Calculator](https://puredevkit.com/tools/css-units/) | css, rem, clamp | Calculate relative lengths and responsive typography. | |
| [ ] | PDK-109 | [Currency Formatter](https://puredevkit.com/tools/money-format/) | currency, intl, iso4217 | Preview localized monetary amounts. | |
| [ ] | PDK-046 | [Email syntax](https://puredevkit.com/tools/email-validator/) | email, syntax, validation | Check address structure without verifying mailbox existence. | |
| [ ] | PDK-044 | [gitignore](https://puredevkit.com/tools/gitignore-generator/) | gitignore, templates, git | Combine ignore rules for selected development stacks. | |
| [ ] | PDK-082 | [Internationalization Playground](https://puredevkit.com/tools/intl-playground/) | intl, locale, plural | Preview locale-aware number and language formatting. | |
| [ ] | PDK-083 | [Line endings](https://puredevkit.com/tools/line-endings/) | crlf, lf, bom | Normalize newline conventions and byte-order marks. | |
| [ ] | PDK-041 | [Line toolkit](https://puredevkit.com/tools/line-toolkit/) | lines, deduplicate, sort | Reorder, filter, and clean lists of lines. | |
| [ ] | PDK-087 | [Localization String Converter](https://puredevkit.com/tools/i18n-strings/) | i18n, arb, gettext | Translate string resources between localization formats. | |
| [ ] | PDK-110 | [Log Formatter](https://puredevkit.com/tools/log-pretty/) | logs, jsonl, logfmt | Normalize structured logs into readable objects. | |
| [ ] | PDK-102 | [Markdown preview](https://puredevkit.com/tools/markdown-preview/) | markdown, preview, toc | Render Markdown and derive a heading index. | |
| [ ] | PDK-081 | [Phone Number Parser](https://puredevkit.com/tools/phone-parser/) | phone, formatting, international | Interpret phone numbers without checking their carriers. | |
| [ ] | PDK-005 | [Regex Tester](https://puredevkit.com/tools/regex-tester/) | regex, match, replace | Try patterns against text and inspect matches. | |
| [ ] | PDK-043 | [Semantic Version Toolkit](https://puredevkit.com/tools/semver-tool/) | semver, versions, ranges | Inspect versions, increment them, and evaluate ranges. | |
| [ ] | PDK-085 | [SPDX License Reference](https://puredevkit.com/tools/spdx-license/) | spdx, license, template | Look up license identifiers and draft file stubs. | |
| [ ] | PDK-080 | [String Similarity Calculator](https://puredevkit.com/tools/string-similarity/) | similarity, levenshtein, dice | Measure resemblance between two strings. | |
| [ ] | PDK-040 | [Text diff](https://puredevkit.com/tools/text-diff/) | diff, patch, compare | Compare text and apply unified patches. | |
| [ ] | PDK-045 | [Unicode Inspector](https://puredevkit.com/tools/unicode-inspector/) | unicode, utf8, normalization | Inspect characters, encodings, and normalization forms. | |
| [ ] | PDK-042 | [Word counter](https://puredevkit.com/tools/word-counter/) | words, characters, reading-time | Measure text length and approximate reading duration. | |

<a id="time"></a>

## Dates, time, and schedules

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-090 | [Business Day / SLO Calculator](https://puredevkit.com/tools/business-days/) | weekdays, business-days, slo | Calculate weekday spans and service error budgets. | |
| [ ] | PDK-049 | [Cron Builder / Explainer](https://puredevkit.com/tools/cron-explained/) | cron, schedule, next-run | Build schedules and preview their execution dates. | |
| [ ] | PDK-091 | [Cron to systemd OnCalendar](https://puredevkit.com/tools/cron-oncalendar/) | systemd, cron, oncalendar | Translate cron schedules into systemd timer expressions. | |
| [ ] | PDK-088 | [Excel Date Converter](https://puredevkit.com/tools/excel-date/) | excel, serial-date, iso8601 | Translate spreadsheet date numbers into ISO dates. | |
| [ ] | PDK-089 | [ISO Duration / Interval Calculator](https://puredevkit.com/tools/iso-duration/) | duration, iso8601, interval | Interpret durations and compare interval overlap. | |
| [ ] | PDK-050 | [Time Zone Explorer](https://puredevkit.com/tools/timezone-explorer/) | timezone, iana, clocks | Compare current times across named time zones. | |
| [ ] | PDK-010 | [Unix Timestamp](https://puredevkit.com/tools/unix-timestamp/) | epoch, timestamp, date | Translate epoch values into calendar dates. | |

<a id="generate"></a>

## Generators and test fixtures

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-093 | [Dummy CSV](https://puredevkit.com/tools/dummy-csv/) | csv, fixtures, importer | Produce fictional tabular records for import tests. | |
| [ ] | PDK-056 | [Dummy File Generator](https://puredevkit.com/tools/dummy-files/) | files, bytes, download | Produce downloadable files of a chosen byte size. | |
| [ ] | PDK-092 | [Dummy logs](https://puredevkit.com/tools/dummy-logs/) | logs, syslog, fixtures | Create sample entries in common logging formats. | |
| [ ] | PDK-095 | [Environment File Templates](https://puredevkit.com/tools/dummy-env/) | dotenv, templates, config | Create sample environment files for selected stacks. | |
| [ ] | PDK-051 | [Fake Data Generator](https://puredevkit.com/tools/fake-data/) | fixtures, people, fake-data | Create fictional person records for tests. | |
| [ ] | PDK-094 | [ICS / vCard Generator](https://puredevkit.com/tools/dummy-ics/) | ics, vcard, calendar | Draft a calendar event or contact file. | |
| [ ] | PDK-096 | [India fixtures](https://puredevkit.com/tools/india-fixtures/) | pan, gstin, ifsc | Inspect Indian identifier formats using sample values. | |
| [ ] | PDK-052 | [Lorem](https://puredevkit.com/tools/lorem-ipsum/) | lorem, paragraphs, placeholders | Produce filler paragraphs in multiple markup formats. | |
| [ ] | PDK-055 | [Payment Test Data](https://puredevkit.com/tools/test-cards/) | payments, sandbox, test-cards | Browse sample payment credentials intended for testing. | |
| [ ] | PDK-098 | [Problem JSON Generator](https://puredevkit.com/tools/rfc7807/) | problem-json, errors, rfc7807 | Prepare a structured HTTP error document. | |
| [ ] | PDK-053 | [REST Fixture Generator](https://puredevkit.com/tools/dummy-rest/) | rest, fixtures, json | Create example API records; no hosted endpoint implied. | |
| [ ] | PDK-021 | [ULID / KSUID](https://puredevkit.com/tools/ulid-generator/) | ulid, ksuid, identifiers | Create identifiers that sort chronologically. | |
| [ ] | PDK-097 | [Unicode Edge-Case Generator](https://puredevkit.com/tools/unicode-torture/) | unicode, rtl, edge-cases | Produce difficult character sequences for input testing. | |
| [ ] | PDK-006 | [UUID Generator](https://puredevkit.com/tools/uuid-generator/) | uuid, nanoid, api-key | Create identifiers and random API keys. | |
| [ ] | PDK-054 | [Webhook Fixture Generator](https://puredevkit.com/tools/dummy-webhooks/) | webhook, fixtures, payload | Prepare example event bodies for provider integrations. | |

<a id="images"></a>

## Images, icons, and design

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-111 | [App Icon Generator](https://puredevkit.com/tools/app-icon-generator/) | icons, ios, android | Create icon bundles for mobile and web apps. | |
| [ ] | PDK-059 | [Color / contrast](https://puredevkit.com/tools/color-tools/) | color, hex, contrast | Convert color values and calculate contrast. | |
| [ ] | PDK-099 | [Identicon Generator](https://puredevkit.com/tools/identicon/) | identicon, avatar, seed | Derive a repeatable avatar image from a seed. | |
| [ ] | PDK-112 | [Image compressor](https://puredevkit.com/tools/image-compressor/) | compression, target-size, photos | Reduce image file size toward a chosen target. | |
| [ ] | PDK-101 | [Image Format Converter](https://puredevkit.com/tools/image-convert/) | png, jpeg, webp | Re-encode images in a selected output format. | |
| [ ] | PDK-100 | [Image Resizer](https://puredevkit.com/tools/image-resize/) | resize, dimensions, canvas | Change image dimensions and export the result. | |
| [ ] | PDK-057 | [Placeholder Image Generator](https://puredevkit.com/tools/placeholder-image/) | placeholder, dimensions, png | Create blank sample images with chosen dimensions. | |
| [ ] | PDK-058 | [QR Code Generator](https://puredevkit.com/tools/qr-code/) | qr, wifi, vcard | Create styled QR images for supported payload types. | |
| [ ] | PDK-113 | [Screenshot Studio](https://puredevkit.com/tools/app-screenshot-generator/) | screenshots, devices, app-store | Compose store artwork using frames and text. | |

<a id="files"></a>

## File sharing

| Done | ID | Tool name | Keywords | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| [ ] | PDK-114 | [Peer-to-Peer File Transfer](https://puredevkit.com/tools/p2p-file-transfer/) | webrtc, sharing, qr | Pair devices for direct browser-to-browser file transfers. | |
