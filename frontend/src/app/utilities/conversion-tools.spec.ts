import { csvToJson, jsonToCsv, csvToMarkdown, readCsv } from './table-tools';
import { lines, numberBases } from './text-tools';
import { convertYaml } from './yaml-tools';
import { transform } from './transforms';
import { TOOLS } from '../catalog/catalog';
import { CONFIG } from './utility-config';
import { UTILITY_GUIDES } from './usage-guides';

describe('CSV and Markdown table conversion', () => {
  it('handles BOM, quotes, embedded newlines, CRLF and exact string values', () => {
    const result = JSON.parse(csvToJson('\uFEFFname,id,notes\r\n"Ada, A.",001,"line 1\r\nline ""2"""\r\n'));
    expect(result).toEqual([{ name: 'Ada, A.', id: '001', notes: 'line 1\r\nline "2"' }]);
    expect(JSON.parse(csvToJson('id\n9007199254740993'))[0].id).toBe('9007199254740993');
  });
  it('rejects duplicate/empty headers, inconsistent records and invalid quotes', () => {
    for (const input of ['x,x\n1,2', ',x\n1,2', 'x,y\n1', 'x\n1,2', 'x\n"unterminated', '']) expect(() => csvToJson(input)).toThrow();
    expect(csvToJson('name\n')).toBe('[]');
    expect(JSON.parse(csvToJson('name\n\n'))).toEqual([{ name: '' }]);
    expect(JSON.parse(csvToJson('name\n""'))).toEqual([{ name: '' }]);
  });
  it('bounds columns, rows and header multiplication before building large output', () => {
    expect(() => readCsv(Array.from({ length: 101 }, (_, i) => `h${i}`).join(','))).toThrow('100 columns');
    expect(() => csvToJson('x\n' + 'v\n'.repeat(5001))).toThrow('5,000');
    expect(() => csvToJson('h'.repeat(10000) + '\n' + 'v\n'.repeat(110))).toThrow('1,000,000');
  });
  it('exports all observed columns and rejects nested or empty records', () => {
    expect(readCsv(jsonToCsv('[{"a":"x,y","b":true},{"b":null,"c":3}]'))).toEqual([['a', 'b', 'c'], ['x,y', 'true', ''], ['', '', '3']]);
    for (const value of ['[]', '{}', '[1]', '[{}]', '[{"x":[]}]', '[{"":1}]']) expect(() => jsonToCsv(value)).toThrow();
  });
  it('protects formula-like headers and values and keeps prototype-like keys as data', () => {
    const result = readCsv(jsonToCsv('[{"=header":"=1+1","name":"@test","__proto__":"safe","n":-2}]'));
    expect(result[0][0]).toBe("'=header");
    expect(result[1]).toEqual(["'=1+1", "'@test", 'safe', '-2']);
    const obj = JSON.parse(csvToJson('__proto__,constructor\nsafe,value'))[0];
    expect(Object.hasOwn(obj, '__proto__')).toBe(true);
    expect(obj.__proto__).toBe('safe');
  });
  it('escapes table delimiters, markup and multiline cells without rendering HTML', () => {
    const result = csvToMarkdown('name,note\nAda,"a|b\n<script>*x* [link](url) & \\"');
    expect(result).toContain('| --- | --- |');
    expect(result).toContain('a&#124;b<br>&lt;script&gt;&#42;x&#42; &#91;link&#93;(url) &amp; &#92;');
    expect(result).not.toContain('<script>');
  });
});
describe('YAML/JSON conversion', () => {
  it('round-trips nested data while keeping strings and prototype-like keys', () => {
    const input = '{"active":true,"id":"001","word":"true","__proto__":{"safe":true},"items":[null,2,"é"]}';
    expect(JSON.parse(convertYaml(convertYaml(input, 'to-yaml'), 'to-json'))).toEqual(JSON.parse(input));
    expect(JSON.parse(convertYaml('date: 2026-09-27\nflag: yes', 'to-json'))).toEqual({ date: '2026-09-27', flag: 'yes' });
  });
  it('converts safe numeric formats and rejects lossy or non-JSON types', () => {
    expect(JSON.parse(convertYaml('hex: 0xff\nfloat: 1.25\nempty: null', 'to-json'))).toEqual({ hex: 255, float: 1.25, empty: null });
    for (const value of ['x: 9007199254740993', 'x: .inf', 'x: .nan', '1: value', 'true: value', 'x: !!set {a, b}', 'x: !custom value']) expect(() => convertYaml(value, 'to-json')).toThrow();
  });
  it('rejects duplicate keys, aliases, streams, directives and malformed documents', () => {
    for (const value of ['x: 1\nx: 2', 'x: &x [*x]', 'a: &v 1\nb: *v', '---\nx: 1\n---\nx: 2', '%YAML 1.1\n---\nyes: on', 'x: [1,', '']) expect(() => convertYaml(value, 'to-json')).toThrow();
  });
  it('bounds nesting and input for both directions', () => {
    expect(() => convertYaml('['.repeat(65) + '0' + ']'.repeat(65), 'to-json')).toThrow('64 levels');
    for (const mode of ['to-json', 'to-yaml']) expect(() => convertYaml(' '.repeat(100001), mode)).toThrow('100,000');
    expect(() => convertYaml('{"x":1,"x":2}', 'to-yaml')).toThrow('duplicate');
  });
});
describe('line and integer utilities', () => {
  it('deduplicates exact lines, normalizes endings, and preserves a final newline', () => {
    expect(lines('a\r\na\rB\r\n', 'unique')).toBe('a\nB\n');
    expect(lines('\n\n', 'unique')).toBe('\n');
    expect(lines('a\nA', 'unique')).toBe('a\nA');
    expect(lines('', 'unique')).toBe('');
  });
  it('sorts deterministically and supports reverse, trim and blank removal', () => {
    expect(lines('2\n10\na\nA', 'sort')).toBe('10\n2\nA\na');
    expect(lines('a\nb\n', 'reverse')).toBe('b\na\n');
    expect(lines(' a \n b ', 'trim')).toBe('a\nb');
    expect(lines(' a \n \nb\n', 'nonblank')).toBe(' a \nb\n');
    expect(lines(' \n', 'nonblank')).toBe('');
  });
  it('converts large signed integers without floating-point loss', () => {
    const output = JSON.parse(numberBases('9007199254740993', 'decimal'));
    expect(output.hexadecimal).toBe('20000000000001');
    expect(JSON.parse(numberBases(output.hexadecimal, 'hex')).decimal).toBe('9007199254740993');
    expect(JSON.parse(numberBases('-ff', 'hex')).binary).toBe('-11111111');
    expect(JSON.parse(numberBases('+377', 'octal')).decimal).toBe('255');
    expect(JSON.parse(numberBases('-0', 'decimal')).decimal).toBe('0');
  });
  it('rejects invalid digits, prefixes, fractions and oversized integers', () => {
    for (const [input, mode] of [['2', 'binary'], ['8', 'octal'], ['ff', 'decimal'], ['0xFF', 'hex'], ['1.2', 'decimal'], ['-', 'decimal'], ['1 0', 'binary'], ['f'.repeat(4097), 'hex']]) expect(() => numberBases(input, mode)).toThrow();
  });
  it('enforces the shared input bound on the new synchronous modules', async () => {
    for (const id of ['csv-json', 'markdown-table', 'line-toolkit', 'number-base-converter']) await expect(transform(id, 'x'.repeat(100001), 'to-json')).rejects.toThrow('100,000');
  });
});
describe('catalog configuration contracts', () => {
  it('provides an executable workspace configuration and guide for each local route and mode', () => {
    expect(new Set(TOOLS.map(tool => tool.id)).size).toBe(TOOLS.length);
    for (const tool of TOOLS.filter(tool => tool.local)) {
      expect(CONFIG[tool.id], tool.id).toBeDefined();
      for (const mode of CONFIG[tool.id].modes) {
        const guide = UTILITY_GUIDES[tool.id]?.[mode.value];
        expect(guide?.input, `${tool.id}/${mode.value}`).toBeTruthy();
        expect(guide?.output).toBeTruthy();
        expect(guide?.exampleInput).toBeDefined();
      }
    }
  });
});
