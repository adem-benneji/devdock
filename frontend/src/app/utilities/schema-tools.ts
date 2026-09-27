import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { boundedOutput, parseJson } from './strict-json';

export function validateSchema(input: string, schemaInput: string, mode: string): string {
  const data = parseJson(input), schema = parseJson(schemaInput);
  if (typeof schema !== 'boolean' && (!schema || typeof schema !== 'object' || Array.isArray(schema))) throw new Error('A JSON Schema must be an object or a boolean.');
  if (!['2020', 'draft7'].includes(mode)) throw new Error('Choose draft 2020-12 or draft-07.');
  const declared = typeof schema === 'object' ? (schema as Record<string, unknown>)['$schema'] : undefined;
  const expected = mode === '2020' ? 'https://json-schema.org/draft/2020-12/schema' : 'http://json-schema.org/draft-07/schema#';
  if (declared !== undefined && declared !== expected) throw new Error(`The selected dialect expects $schema: ${expected}`);
  // No loadSchema callback: missing external references fail without fetching.
  const engine = mode === '2020' ? new Ajv2020({ strict: true, allErrors: false, ownProperties: true, allowUnionTypes: true, validateFormats: true, logger: false }) : new Ajv({ strict: true, allErrors: false, ownProperties: true, allowUnionTypes: true, validateFormats: true, logger: false });
  addFormats(engine);
  try {
    if (typeof schema === 'object' && (schema as Record<string, unknown>)['$async'] === true) throw new Error('Asynchronous schemas are not supported.');
    const validate = engine.compile(schema);
    const valid = validate(data);
    return boundedOutput(JSON.stringify({ valid, dialect: mode === '2020' ? '2020-12' : 'draft-07', errorsTruncated: (validate.errors?.length ?? 0) > 100, errors: (validate.errors ?? []).slice(0, 100).map(error => ({ instancePath: error.instancePath, schemaPath: error.schemaPath, keyword: error.keyword, message: error.message, params: error.params })), errorReporting: 'Stops at the first failing branch; compound keywords may report multiple errors.' }, null, 2));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Asynchronous')) throw error;
    throw new Error('Invalid or unsupported schema. Check keyword spelling/types, the selected dialect, and references. Remote references are never fetched.');
  }
}
