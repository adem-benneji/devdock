import he from 'he';
import { boundedOutput, parseJson } from './strict-json';

export function htmlEntities(input: string, mode: string): string {
  if (mode === 'encode') return boundedOutput(he.encode(input, { useNamedReferences: true, strict: true }));
  if (mode === 'decode') return boundedOutput(he.decode(input, { strict: true }));
  throw new Error('Choose an HTML entity operation.');
}
export function jsonString(input: string, mode: string): string {
  if (mode === 'escape') return boundedOutput(JSON.stringify(input));
  const value = parseJson(input);
  if (typeof value !== 'string') throw new Error('Enter one JSON string, including its surrounding double quotes.');
  return value;
}
function assertUnicode(input: string) {
  for (const char of input) {
    const point = char.codePointAt(0)!;
    if (point >= 0xd800 && point <= 0xdfff) throw new Error('Input contains an unpaired UTF-16 surrogate. Use well-formed Unicode text.');
  }
}
export function textHex(input: string, mode: string): string {
  if (mode === 'encode') {
    assertUnicode(input);
    return boundedOutput([...new TextEncoder().encode(input)].map(byte => byte.toString(16).padStart(2, '0')).join(' '));
  }
  const hex = input.replace(/\s/g, '');
  if (!/^(?:[\da-fA-F]{2})*$/.test(hex)) throw new Error('Enter complete hexadecimal byte pairs, optionally separated by whitespace.');
  const bytes = Uint8Array.from(hex.match(/.{2}/g) ?? [], pair => Number.parseInt(pair, 16));
  try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
  catch { throw new Error('These bytes are not valid UTF-8 text.'); }
}
export function unicodeInfo(input: string, mode: string): string {
  assertUnicode(input);
  if (mode !== 'inspect') {
    if (!['NFC', 'NFD', 'NFKC', 'NFKD'].includes(mode)) throw new Error('Choose a Unicode normalization form.');
    return boundedOutput(input.normalize(mode as 'NFC'));
  }
  const characters = [...input];
  if (characters.length > 1000) throw new Error('Inspect at most 1,000 Unicode code points at a time.');
  let offset = 0;
  const points = characters.map(char => {
    const entry = { character: char, codePoint: `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`, utf16Offset: offset, utf8Hex: textHex(char, 'encode') };
    offset += char.length; return entry;
  });
  return boundedOutput(JSON.stringify({ codePoints: points.length, utf16Units: input.length, utf8Bytes: new TextEncoder().encode(input).length, graphemes: [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(input)].length, points }, null, 2));
}
export function lineEndings(input: string, mode: string): string {
  if (mode === 'inspect') {
    const crlf = input.match(/\r\n/g)?.length ?? 0;
    return JSON.stringify({ crlf, lf: (input.match(/\n/g)?.length ?? 0) - crlf, cr: (input.match(/\r/g)?.length ?? 0) - crlf, leadingBom: input.startsWith('\uFEFF') }, null, 2);
  }
  if (mode === 'strip-bom') return input.replace(/^\uFEFF/, '');
  const newline = { lf: '\n', crlf: '\r\n', cr: '\r' }[mode];
  if (!newline) throw new Error('Choose a line-ending operation.');
  return input.replace(/\r\n|\r|\n/g, newline);
}
export const PASSWORD_ALPHABETS: Record<string, string> = {
  mixed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}:,.?',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
};
export function generatePassword(input: string, mode: string): string {
  const count = Number(input.trim()), alphabet = PASSWORD_ALPHABETS[mode];
  if (!/^\d+$/.test(input.trim()) || count < 8 || count > 128 || !alphabet) throw new Error('Choose a password length from 8 to 128 and a supported alphabet.');
  if (!globalThis.crypto?.getRandomValues) throw new Error('Password generation needs browser cryptographic randomness.');
  const limit = 256 - (256 % alphabet.length);
  let result = '';
  while (result.length < count) {
    const bytes = crypto.getRandomValues(new Uint8Array(256));
    for (const byte of bytes) {
      if (byte < limit) result += alphabet[byte % alphabet.length];
      if (result.length === count) break;
    }
  }
  return result;
}
export function slug(input: string): string {
  const result = input.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  if (!result) throw new Error('Enter text containing at least one letter or number.');
  return boundedOutput(result);
}
