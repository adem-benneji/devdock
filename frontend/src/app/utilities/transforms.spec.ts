import { base64, convertCase, timestamp, transform } from './transforms';

describe('browser utility behavior', () => {
  it('round-trips Unicode as UTF-8 Base64', () => {
    const input = 'Hello 👋 — مرحبا';
    expect(base64(base64(input, false), true)).toBe(input);
  });
  it('rejects malformed Base64 and binary that is not UTF-8', () => {
    for (const value of ['###', 'Zh==', '/w==', 'Zg']) expect(() => base64(value, true)).toThrow();
  });
  it('supports large allowed text without spreading the full byte array', () => {
    const input = 'é'.repeat(50000);
    expect(base64(base64(input, false), true)).toBe(input);
  });
  it('splits acronyms, existing camelCase, punctuation and Unicode words', () => {
    expect(convertCase('HTTPResponse isReady', 'snake')).toBe('http_response_is_ready');
    expect(convertCase('hello-world', 'camel')).toBe('helloWorld');
    expect(convertCase('Héllo Monde', 'kebab')).toBe('héllo-monde');
    expect(convertCase('Hello, World!', 'upper')).toBe('HELLO, WORLD!');
    expect(() => convertCase('---', 'camel')).toThrow();
  });
  it('converts zero, negative and fractional epoch values with explicit units', () => {
    expect(timestamp('0', 'seconds')).toBe('1970-01-01T00:00:00.000Z');
    expect(timestamp('-1', 'milliseconds')).toBe('1969-12-31T23:59:59.999Z');
    expect(timestamp('1704067200.123', 'seconds')).toBe('2024-01-01T00:00:00.123Z');
    expect(timestamp('2024-01-01T00:00:00Z', 'iso')).toBe('1704067200');
  });
  it('rejects normalized invalid calendar dates and implicit timezones', () => {
    for (const value of ['2024-02-31T00:00:00Z', '2023-02-29T00:00:00Z', '2024-01-01', '2024-01-01T24:00:00Z']) expect(() => timestamp(value, 'iso')).toThrow();
    expect(timestamp('2024-02-29T00:00:00.1Z', 'iso')).toBe('1709164800.1');
    expect(() => timestamp('99999999999999999999', 'seconds')).toThrow();
  });
  it('round-trips URL components and handles invalid escapes', async () => {
    const input = 'é space &+';
    const encoded = await transform('url-codec', input, 'encode');
    expect(await transform('url-codec', encoded, 'decode')).toBe(input);
    await expect(transform('url-codec', '%ZZ', 'decode')).rejects.toThrow();
  });
  it('bounds user input and UUID batch sizes', async () => {
    await expect(transform('base64', 'a'.repeat(100001), 'encode')).rejects.toThrow('100,000');
    for (const value of ['0', '101', '1.5', '-1', 'no']) await expect(transform('uuid-generator', value, 'v4')).rejects.toThrow('1 and 100');
  });
});
