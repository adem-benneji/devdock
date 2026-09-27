import { parseJson } from './strict-json';
import { jsonToSchema, jsonToTypescript } from './data-tools';
import { queryJson } from './jsonpath-engine';
import { decodeJwt, parseUrl, countWords } from './inspect-tools';
import { transform } from './transforms';

function jwt(claims: unknown) {
  const encode = (value: unknown) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'none' })}.${encode(claims)}.`;
}
describe('strict sample JSON', () => {
  it('rejects malformed, duplicate, unsafe and excessively nested JSON', () => {
    for (const value of ['{"x":1,}', '/*no*/{}', '{}[]', '{"x":1,"\\u0078":2}', '1e400', '9007199254740993', '['.repeat(65) + '0' + ']'.repeat(65)]) expect(() => parseJson(value)).toThrow();
    expect(parseJson('['.repeat(64) + '0' + ']'.repeat(64))).toBeTruthy();
  });
  it('preserves prototype-like keys as data', () => {
    const value = parseJson('{"__proto__":{"polluted":true},"constructor":1}') as object;
    expect(Object.hasOwn(value, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });
});
describe('sample-driven generation', () => {
  it('infers nested types, heterogeneous arrays, empty arrays and quoted property names', () => {
    const output = jsonToTypescript('{"a-b":[1,"x",null],"empty":[],"child":{"active":true}}');
    expect(output).toContain('"a-b": Array<number | string | null>');
    expect(output).toContain('"empty": Array<unknown>');
    expect(output).toContain('"active": boolean;');
    expect(jsonToTypescript('null')).toBe('export type Root = null;');
    expect(jsonToTypescript('{}')).toBe('export type Root = Record<string, unknown>;');
  });
  it('produces a draft schema with required fields, array alternatives and safe property keys', () => {
    const schema = JSON.parse(jsonToSchema('{"items":[1,2,"x"],"empty":[],"__proto__":null}'));
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(schema.required).toEqual(['items', 'empty', '__proto__']);
    expect(schema.properties.items.items.anyOf).toEqual([{ type: 'integer' }, { type: 'string' }]);
    expect(schema.properties.empty.items).toEqual({});
    expect(schema.properties.__proto__).toEqual({ type: 'null' });
    expect(JSON.parse(jsonToSchema('1.5')).type).toBe('number');
  });
});
describe('JSONPath evaluation', () => {
  const input = '{"users":[{"name":"Ada"},{"name":"Lin"}],"name":"root"}';
  it('returns paths and values for wildcards, recursive descent and slices', () => {
    const result = JSON.parse(queryJson(input, '$.users[*].name'));
    expect(result.count).toBe(2);
    expect(result.matches[0]).toEqual({ path: "$['users'][0]['name']", value: 'Ada' });
    expect(JSON.parse(queryJson(input, '$..name')).count).toBe(3);
    expect(JSON.parse(queryJson(input, '$.users[0:1]')).count).toBe(1);
    expect(JSON.parse(queryJson(input, '$.missing'))).toEqual({ count: 0, matches: [] });
  });
  it('supports the root and prototype-like own properties', () => {
    expect(JSON.parse(queryJson('42', '$')).matches[0].value).toBe(42);
    expect(JSON.parse(queryJson('null', '$')).matches[0].value).toBeNull();
    expect(JSON.parse(queryJson('{"__proto__":7}', "$['__proto__']")).matches[0].value).toBe(7);
  });
  it('rejects scripts, broad results and oversized input', () => {
    for (const path of ['users', '$.users[?(@.name)]', '$.users[(@.length-1)]', '$.missing[?(@.name)]', '$.users[', '$..', '$.users[::0]']) expect(() => queryJson(input, path)).toThrow();
    expect(() => queryJson(JSON.stringify(Array.from({ length: 501 }, (_, i) => i)), '$[*]')).toThrow('500');
    expect(() => queryJson(' '.repeat(100001), '$')).toThrow('100,000');
  });
});
describe('inspection tools', () => {
  it('decodes JWT claims and checks expiry without claiming verification', () => {
    const result = JSON.parse(decodeJwt('Bearer ' + jwt({ sub: 'abc', exp: 10 }), 10000));
    expect(result.signatureVerified).toBe(false);
    expect(result.signaturePresent).toBe(false);
    expect(result.claims.sub).toBe('abc');
    expect(result.expiration.status).toBe('expired');
    expect(JSON.parse(decodeJwt(jwt({ exp: 20 }), 10000)).expiration.status).toBe('not expired');
    expect(JSON.parse(decodeJwt(jwt({}), 10000)).expiration.status).toBe('not provided');
    expect(JSON.parse(decodeJwt(jwt({ exp: '20' }), 10000)).expiration.status).toContain('invalid');
  });
  it('rejects malformed and non-object JWT payloads', () => {
    for (const token of ['not-a-token', 'a.b.c.d.e', '!!!!.e30.', jwt([]), jwt(null), 'e30=.e30.']) expect(() => decodeJwt(token)).toThrow();
  });
  it('parses duplicate URL parameters without exposing credentials', () => {
    const result = JSON.parse(parseUrl('https://user:secret@example.com:8443/a%20b?x=one+two&x=3#hi%20there'));
    expect(result.query).toEqual([{ name: 'x', value: 'one two' }, { name: 'x', value: '3' }]);
    expect(result.port).toBe('8443');
    expect(result.pathname).toBe('/a%20b');
    expect(result.credentialsPresent).toBe(true);
    expect(JSON.stringify(result)).not.toContain('secret');
    expect(JSON.parse(parseUrl('http://example.com')).port).toBe('80');
    for (const value of ['/relative', 'https:example.com', 'javascript:alert(1)', 'file:///tmp/test']) expect(() => parseUrl(value)).toThrow();
  });
  it('counts Unicode graphemes, CRLF lines, empty text and estimated reading time', () => {
    expect(JSON.parse(countWords('Hello world!'))).toEqual({ words: 2, characters: 12, charactersWithoutWhitespace: 11, lines: 1, utf8Bytes: 12, estimatedReadingSeconds: 1 });
    const unicode = JSON.parse(countWords('é 👨‍👩‍👧‍👦\r\n'));
    expect(unicode.characters).toBe(4);
    expect(unicode.charactersWithoutWhitespace).toBe(2);
    expect(unicode.lines).toBe(2);
    expect(JSON.parse(countWords('')).lines).toBe(0);
    expect(JSON.parse(countWords('word '.repeat(200))).estimatedReadingSeconds).toBe(60);
  });
  it('enforces input limits through the shared dispatcher for each new synchronous tool', async () => {
    for (const id of ['json-to-typescript', 'json-schema-generator', 'jwt-decoder', 'url-parser', 'word-counter']) {
      await expect(transform(id, 'x'.repeat(100001), '')).rejects.toThrow('100,000');
    }
  });
});
