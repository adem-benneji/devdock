import { compareJson, flattenJson, unflattenJson, jsonLines } from './structure-tools';
import { testRegex, compareText, analyze } from './analysis-tools';
import { htmlEntities, jsonString, textHex, unicodeInfo, lineEndings, generatePassword, PASSWORD_ALPHABETS, slug } from './encoding-tools';
import { transform } from './transforms';

describe('structured JSON utilities', () => {
  it('round-trips JSON Lines, escaped newlines, scalars, null and empty arrays', () => {
    const array = '[{"text":"a\\nb"},null,42,"x"]';
    expect(JSON.parse(jsonLines(jsonLines(array, 'to-lines'), 'to-array'))).toEqual(JSON.parse(array));
    expect(jsonLines('[]', 'to-lines')).toBe('');
    expect(jsonLines('', 'to-array')).toBe('[]');
    expect(JSON.parse(jsonLines('1\r\n2\r\n', 'to-array'))).toEqual([1, 2]);
  });
  it('reports the failing JSON Lines record and rejects duplicate keys and excessive records', () => {
    for (const input of ['{}\n\n{}', '{}\n{"x":1,"x":2}', '{}\nnot json']) expect(() => jsonLines(input, 'to-array')).toThrow('Line 2');
    expect(() => jsonLines('{}', 'to-lines')).toThrow('array');
    expect(() => jsonLines('0\n'.repeat(5001), 'to-array')).toThrow('5,000');
  });
  it('round-trips typed paths, numeric object keys, empty keys, dots, containers and roots', () => {
    for (const input of ['{"0":{"a.b":1,"":[]},"items":[{},null,true],"__proto__":{"x":2}}', 'null', '0', '""', '[]', '{}']) {
      expect(JSON.parse(unflattenJson(flattenJson(input)))).toEqual(JSON.parse(input));
    }
    expect(JSON.parse(flattenJson('{"0":[1]}'))[0].path).toEqual(['0', 0]);
    expect(Object.hasOwn(JSON.parse(unflattenJson('[{"path":["__proto__"],"value":1}]')), '__proto__')).toBe(true);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });
  it('rejects duplicate, conflicting, sparse, invalid and ambiguous flat entries', () => {
    const cases = [
      '[]', '[{"path":["a"],"value":1},{"path":["a"],"value":2}]',
      '[{"path":["a"],"value":1},{"path":["a","b"],"value":2}]',
      '[{"path":["a","b"],"value":1},{"path":["a"],"value":2}]',
      '[{"path":[1],"value":1}]', '[{"path":[-1],"value":1}]',
      '[{"path":[0],"value":1},{"path":["x"],"value":2}]',
      '[{"path":[],"value":{"a":1}}]', '[{"path":[null],"value":1}]',
    ];
    for (const value of cases) expect(() => unflattenJson(value)).toThrow();
    expect(() => flattenJson(JSON.stringify(Array(5001).fill(1)))).toThrow('5,000');
  });
  it('compares JSON semantically with escaped paths and index-based arrays', () => {
    expect(JSON.parse(compareJson('{"x":1,"y":2}', '{"y":2,"x":1}')).equal).toBe(true);
    const result = JSON.parse(compareJson('{"a/b~":1,"remove":null,"items":[1]}', '{"a/b~":2,"items":[1,2],"add":true}'));
    expect(result.changes).toContainEqual({ kind: 'changed', path: '/a~1b~0', before: 1, after: 2 });
    expect(result.changes).toContainEqual({ kind: 'removed', path: '/remove', before: null });
    expect(result.changes).toContainEqual({ kind: 'added', path: '/items/1', after: 2 });
    expect(result.changes).toContainEqual({ kind: 'added', path: '/add', after: true });
    expect(JSON.parse(compareJson('null', '[]')).changes[0].path).toBe('');
  });
  it('bounds JSON comparison output and rejects invalid input on either side', () => {
    expect(() => compareJson(JSON.stringify(Array(501).fill(0)), JSON.stringify(Array(501).fill(1)))).toThrow('500');
    expect(() => compareJson('{}', '{"x":1,"x":2}')).toThrow('duplicate');
  });
});
describe('regex and text analysis', () => {
  it('returns numbered and named captures with UTF-16 offsets', () => {
    const result = JSON.parse(testRegex('👋 Ada42 Lin7', 'match', '(?<name>[A-Za-z]+)(\\d+)', 'g', ''));
    expect(result.count).toBe(2);
    expect(result.matches[0]).toEqual({ text: 'Ada42', index: 3, end: 8, groups: ['Ada', '42'], namedGroups: { name: 'Ada' } });
  });
  it('advances zero-length Unicode matches without splitting surrogate pairs', () => {
    const result = JSON.parse(testRegex('👋', 'match', '(?:)', 'gu', ''));
    expect(result.matches.map((match: { index: number }) => match.index)).toEqual([0, 2]);
    expect(JSON.parse(testRegex('a a', 'match', 'a', '', '')).count).toBe(1);
    expect(JSON.parse(testRegex('abc', 'match', 'z', 'g', '')).count).toBe(0);
  });
  it('supports replacement capture syntax and validates patterns/flags/match counts', () => {
    expect(testRegex('Ada42 Lin7', 'replace', '([A-Za-z]+)(\\d+)', 'g', '$2:$1')).toBe('42:Ada 7:Lin');
    expect(testRegex('aaa', 'replace', 'a', '', '')).toBe('aa');
    for (const [pattern, flags] of [['[', 'g'], ['a', 'gg'], ['a', 'x']]) expect(() => testRegex('abc', 'match', pattern, flags, '')).toThrow();
    expect(() => testRegex('a'.repeat(501), 'match', 'a', 'g', '')).toThrow('500');
    expect(() => testRegex('', 'match', 'a'.repeat(1001), '', '')).toThrow('1,000');
  });
  it('compares exact lines, including whitespace and final newlines', () => {
    const result = JSON.parse(compareText('same\nold\n', 'same\nnew\n'));
    expect(result.chunks).toEqual([{ kind: 'unchanged', lines: 1, text: 'same\n' }, { kind: 'removed', lines: 1, text: 'old\n' }, { kind: 'added', lines: 1, text: 'new\n' }]);
    expect(JSON.parse(compareText('', '')).equal).toBe(true);
    expect(JSON.parse(compareText('x\r\n', 'x\n')).equal).toBe(false);
    expect(JSON.parse(compareText('x', 'x\n')).equal).toBe(false);
  });
  it('bounds both worker editors before analysis', () => {
    expect(() => analyze('json-diff', '{}', 'compare', { comparison: ' '.repeat(100001) })).toThrow('100,000');
  });
});
describe('text encodings and generation', () => {
  it('encodes and strictly decodes HTML entities without needing a DOM', () => {
    expect(htmlEntities('<b>A & B</b>', 'encode')).toBe('&lt;b&gt;A &amp; B&lt;/b&gt;');
    expect(htmlEntities('&copy; &#x1F44B; &lt;script&gt;', 'decode')).toBe('© 👋 <script>');
    expect(() => htmlEntities('&notAnEntity;', 'decode')).toThrow();
  });
  it('round-trips JSON string syntax and rejects non-string JSON', () => {
    const text = 'Hello "Ada"\n\t👋\\';
    expect(jsonString(jsonString(text, 'escape'), 'unescape')).toBe(text);
    for (const input of ['{}', 'null', '"bad\\q"', 'bare text']) expect(() => jsonString(input, 'unescape')).toThrow();
  });
  it('round-trips UTF-8, including a leading BOM, and rejects malformed bytes', () => {
    for (const text of ['Hi 👋 مرحبا', '\uFEFFhello', '']) expect(textHex(textHex(text, 'encode'), 'decode')).toBe(text);
    for (const text of ['f', 'ff', 'c0 af', '0x41', 'ed a0 80']) expect(() => textHex(text, 'decode')).toThrow();
    expect(() => textHex('\ud800', 'encode')).toThrow('surrogate');
  });
  it('reports code points separately from graphemes and UTF-16 units', () => {
    const info = JSON.parse(unicodeInfo('e\u0301👋', 'inspect'));
    expect(info.codePoints).toBe(3); expect(info.graphemes).toBe(2); expect(info.utf16Units).toBe(4);
    expect(info.points[2]).toMatchObject({ codePoint: 'U+1F44B', utf16Offset: 2, utf8Hex: 'f0 9f 91 8b' });
    expect(unicodeInfo('e\u0301', 'NFC')).toBe('é');
    expect(unicodeInfo('Ａ', 'NFKC')).toBe('A');
    expect(() => unicodeInfo('a'.repeat(1001), 'inspect')).toThrow('1,000');
  });
  it('counts and normalizes newlines without adding or stripping final breaks', () => {
    const input = '\uFEFFa\r\nb\nc\r';
    expect(JSON.parse(lineEndings(input, 'inspect'))).toEqual({ crlf: 1, lf: 1, cr: 1, leadingBom: true });
    expect(lineEndings(input, 'lf')).toBe('\uFEFFa\nb\nc\n');
    expect(lineEndings('a\nb', 'crlf')).toBe('a\r\nb');
    expect(lineEndings(input, 'strip-bom')).toBe('a\r\nb\nc\r');
    expect(lineEndings('a\uFEFFb', 'strip-bom')).toBe('a\uFEFFb');
  });
  it('generates requested password lengths from the selected alphabet using real Web Crypto', () => {
    for (const mode of ['mixed', 'alphanumeric']) {
      const value = generatePassword('128', mode);
      expect(value.length).toBe(128);
      expect([...value].every(char => PASSWORD_ALPHABETS[mode].includes(char))).toBe(true);
    }
    for (const input of ['7', '129', '1.5', 'NaN', '']) expect(() => generatePassword(input, 'mixed')).toThrow();
  });
  it('builds Unicode-friendly slugs and handles decomposable accents and empty results', () => {
    expect(slug('Café & API: Hello, World!')).toBe('cafe-api-hello-world');
    expect(slug('  مرحبا بالعالم  ')).toBe('مرحبا-بالعالم');
    expect(slug('already--a-slug')).toBe('already-a-slug');
    expect(() => slug('!!!')).toThrow();
  });
  it('enforces the shared input bound for every added synchronous tool', async () => {
    for (const id of ['json-lines', 'json-flatten', 'html-entities', 'json-string', 'text-hex', 'unicode-inspector', 'line-endings', 'password-generator', 'slug-generator']) await expect(transform(id, 'a'.repeat(100001), '')).rejects.toThrow('100,000');
  });
});
