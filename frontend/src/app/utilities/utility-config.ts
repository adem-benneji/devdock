import type { Configuration } from './configuration';
import { config as regex_tester } from '../features/regex-tester/config';
import { config as json_diff } from '../features/json-diff/config';
import { config as text_diff } from '../features/text-diff/config';
import { config as json_lines } from '../features/json-lines/config';
import { config as json_flatten } from '../features/json-flatten/config';
import { config as html_entities } from '../features/html-entities/config';
import { config as json_string } from '../features/json-string/config';
import { config as text_hex } from '../features/text-hex/config';
import { config as unicode_inspector } from '../features/unicode-inspector/config';
import { config as line_endings } from '../features/line-endings/config';
import { config as password_generator } from '../features/password-generator/config';
import { config as slug_generator } from '../features/slug-generator/config';
import { config as json_schema_validator } from '../features/json-schema-validator/config';
import { config as sql_formatter } from '../features/sql-formatter/config';
import { config as semver_tool } from '../features/semver-tool/config';
import { config as hmac_signer } from '../features/hmac-signer/config';
import { config as pkce_generator } from '../features/pkce-generator/config';
import { config as ipv4_cidr } from '../features/ipv4-cidr/config';
import { config as url_query_editor } from '../features/url-query-editor/config';
import { config as gzip_deflate } from '../features/gzip-deflate/config';
import { config as csv_json } from '../features/csv-json/config';
import { config as yaml_json } from '../features/yaml-json/config';
import { config as markdown_table } from '../features/markdown-table/config';
import { config as line_toolkit } from '../features/line-toolkit/config';
import { config as number_base_converter } from '../features/number-base-converter/config';
import { config as jsonpath_tester } from '../features/jsonpath-tester/config';
import { config as json_to_typescript } from '../features/json-to-typescript/config';
import { config as json_schema_generator } from '../features/json-schema-generator/config';
import { config as jwt_decoder } from '../features/jwt-decoder/config';
import { config as url_parser } from '../features/url-parser/config';
import { config as word_counter } from '../features/word-counter/config';
import { config as base64 } from '../features/base64/config';
import { config as url_codec } from '../features/url-codec/config';
import { config as hash_generator } from '../features/hash-generator/config';
import { config as uuid_generator } from '../features/uuid-generator/config';
import { config as unix_timestamp } from '../features/unix-timestamp/config';
import { config as case_converter } from '../features/case-converter/config';
export const CONFIG: Record<string, Configuration> = {
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
