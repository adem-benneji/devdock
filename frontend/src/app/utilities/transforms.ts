import { lines, numberBases } from './text-tools';
import { jsonToTypescript, jsonToSchema } from './data-tools';
import { decodeJwt, parseUrl, countWords } from './inspect-tools';
export function base64(input: string, decode: boolean): string {
  if (decode) {
    const normalized = input.replace(/\s/g, '');
    try {
      const binary = atob(normalized);
      if (btoa(binary) !== normalized) throw new Error('Non-canonical base64');
      return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
    } catch { throw new Error('Enter valid, padded Base64 containing UTF-8 text.'); }
  }
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary);
}
export function convertCase(input: string, mode: string): string {
  if (mode === 'upper') return input.toUpperCase();
  if (mode === 'lower') return input.toLowerCase();
  const words = input.replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2').replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2').match(/[\p{L}\p{N}]+/gu)?.map(word => word.toLowerCase()) ?? [];
  if (!words.length) throw new Error('Enter text containing at least one letter or number.');
  return mode === 'camel' ? words.map((word, index) => index ? word[0].toUpperCase() + word.slice(1) : word).join('') : words.join(mode === 'snake' ? '_' : '-');
}
export function timestamp(input: string, mode: string): string {
  const value = input.trim();
  if (mode === 'iso') {
    const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
    const date = new Date(value);
    if (!match || !Number.isFinite(date.getTime()) || date.toISOString() !== `${match[1]}.${(match[2] ?? '').padEnd(3, '0')}Z`) throw new Error('Enter a valid UTC date, such as 2024-01-01T00:00:00Z.');
    return String(date.getTime() / 1000);
  }
  if (!(mode === 'seconds' ? /^-?\d+(?:\.\d{1,3})?$/ : /^-?\d+$/).test(value)) throw new Error('Enter a numeric timestamp in the selected unit.');
  const milliseconds = mode === 'seconds' ? Math.round(Number(value) * 1000) : Number(value);
  const date = new Date(milliseconds);
  if (!Number.isSafeInteger(milliseconds) || !Number.isFinite(date.getTime())) throw new Error('This timestamp is outside the supported date range.');
  return date.toISOString();
}
export async function transform(id: string, input: string, mode: string): Promise<string> {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters at a time.');
  switch (id) {
    case 'json-lines': return (await import('./structure-tools')).jsonLines(input, mode);
    case 'json-flatten': {
      const engine = await import('./structure-tools');
      if (mode === 'flatten') return engine.flattenJson(input);
      if (mode === 'unflatten') return engine.unflattenJson(input);
      throw new Error('Choose Flatten or Restore.');
    }
    case 'html-entities': return (await import('./encoding-tools')).htmlEntities(input, mode);
    case 'json-string': return (await import('./encoding-tools')).jsonString(input, mode);
    case 'text-hex': return (await import('./encoding-tools')).textHex(input, mode);
    case 'unicode-inspector': return (await import('./encoding-tools')).unicodeInfo(input, mode);
    case 'line-endings': return (await import('./encoding-tools')).lineEndings(input, mode);
    case 'password-generator': return (await import('./encoding-tools')).generatePassword(input, mode);
    case 'slug-generator': return (await import('./encoding-tools')).slug(input);
    case 'csv-json': {
      const { csvToJson, jsonToCsv } = await import('./table-tools');
      if (mode === 'to-json') return csvToJson(input);
      if (mode === 'to-csv') return jsonToCsv(input);
      throw new Error('Choose CSV to JSON or JSON to CSV.');
    }
    case 'markdown-table': return (await import('./table-tools')).csvToMarkdown(input);
    case 'line-toolkit': return lines(input, mode);
    case 'number-base-converter': return numberBases(input, mode);
    case 'json-to-typescript': return jsonToTypescript(input);
    case 'json-schema-generator': return jsonToSchema(input);
    case 'jwt-decoder': return decodeJwt(input);
    case 'url-parser': return parseUrl(input);
    case 'word-counter': return countWords(input);
    case 'base64': return base64(input, mode === 'decode');
    case 'url-codec':
      try { return mode === 'decode' ? decodeURIComponent(input) : encodeURIComponent(input); }
      catch { throw new Error('The URL component contains an invalid escape or Unicode sequence.'); }
    case 'hash-generator': {
      if (!globalThis.crypto?.subtle) throw new Error('Hashing needs a secure browser context (HTTPS or localhost).');
      const algorithm = ({ sha256: 'SHA-256', sha384: 'SHA-384', sha512: 'SHA-512' } as Record<string, string>)[mode];
      if (!algorithm) throw new Error('Choose SHA-256, SHA-384, or SHA-512.');
      const bytes = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input));
      return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
    }
    case 'uuid-generator': {
      const count = Number(input);
      if (!/^\d+$/.test(input.trim()) || !Number.isInteger(count) || count < 1 || count > 100) throw new Error('Choose a whole number between 1 and 100.');
      if (!globalThis.crypto?.randomUUID) throw new Error('UUID generation needs a secure browser context (HTTPS or localhost).');
      return Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
    }
    case 'unix-timestamp': return timestamp(input, mode);
    case 'case-converter': return convertCase(input, mode);
    default: throw new Error('This tool is not available.');
  }
}
