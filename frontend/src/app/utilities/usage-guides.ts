import type { UsageGuide } from '../shared/tool-guide';
import { guides as regex_tester } from '../features/regex-tester/guide';
import { guides as json_diff } from '../features/json-diff/guide';
import { guides as text_diff } from '../features/text-diff/guide';
import { guides as json_lines } from '../features/json-lines/guide';
import { guides as json_flatten } from '../features/json-flatten/guide';
import { guides as html_entities } from '../features/html-entities/guide';
import { guides as json_string } from '../features/json-string/guide';
import { guides as text_hex } from '../features/text-hex/guide';
import { guides as unicode_inspector } from '../features/unicode-inspector/guide';
import { guides as line_endings } from '../features/line-endings/guide';
import { guides as password_generator } from '../features/password-generator/guide';
import { guides as slug_generator } from '../features/slug-generator/guide';
import { guides as json_schema_validator } from '../features/json-schema-validator/guide';
import { guides as sql_formatter } from '../features/sql-formatter/guide';
import { guides as semver_tool } from '../features/semver-tool/guide';
import { guides as hmac_signer } from '../features/hmac-signer/guide';
import { guides as pkce_generator } from '../features/pkce-generator/guide';
import { guides as ipv4_cidr } from '../features/ipv4-cidr/guide';
import { guides as url_query_editor } from '../features/url-query-editor/guide';
import { guides as gzip_deflate } from '../features/gzip-deflate/guide';
import { guides as csv_json } from '../features/csv-json/guide';
import { guides as yaml_json } from '../features/yaml-json/guide';
import { guides as markdown_table } from '../features/markdown-table/guide';
import { guides as line_toolkit } from '../features/line-toolkit/guide';
import { guides as number_base_converter } from '../features/number-base-converter/guide';
import { guides as jsonpath_tester } from '../features/jsonpath-tester/guide';
import { guides as json_to_typescript } from '../features/json-to-typescript/guide';
import { guides as json_schema_generator } from '../features/json-schema-generator/guide';
import { guides as jwt_decoder } from '../features/jwt-decoder/guide';
import { guides as url_parser } from '../features/url-parser/guide';
import { guides as word_counter } from '../features/word-counter/guide';
import { guides as base64 } from '../features/base64/guide';
import { guides as url_codec } from '../features/url-codec/guide';
import { guides as hash_generator } from '../features/hash-generator/guide';
import { guides as uuid_generator } from '../features/uuid-generator/guide';
import { guides as unix_timestamp } from '../features/unix-timestamp/guide';
import { guides as case_converter } from '../features/case-converter/guide';
export const UTILITY_GUIDES: Record<string, Record<string, UsageGuide>> = {
  'regex-tester': regex_tester,
  'json-diff': json_diff,
  'text-diff': text_diff,
  'json-lines': json_lines,
  'json-flatten': json_flatten,
  'html-entities': html_entities,
  'json-string': json_string,
  'text-hex': text_hex,
  'unicode-inspector': unicode_inspector,
  'line-endings': line_endings,
  'password-generator': password_generator,
  'slug-generator': slug_generator,
  'json-schema-validator': json_schema_validator,
  'sql-formatter': sql_formatter,
  'semver-tool': semver_tool,
  'hmac-signer': hmac_signer,
  'pkce-generator': pkce_generator,
  'ipv4-cidr': ipv4_cidr,
  'url-query-editor': url_query_editor,
  'gzip-deflate': gzip_deflate,
  'csv-json': csv_json,
  'yaml-json': yaml_json,
  'markdown-table': markdown_table,
  'line-toolkit': line_toolkit,
  'number-base-converter': number_base_converter,
  'jsonpath-tester': jsonpath_tester,
  'json-to-typescript': json_to_typescript,
  'json-schema-generator': json_schema_generator,
  'jwt-decoder': jwt_decoder,
  'url-parser': url_parser,
  'word-counter': word_counter,
  'base64': base64,
  'url-codec': url_codec,
  'hash-generator': hash_generator,
  'uuid-generator': uuid_generator,
  'unix-timestamp': unix_timestamp,
  'case-converter': case_converter,
};
