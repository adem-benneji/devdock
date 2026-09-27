import { parseJson } from './strict-json';

function decodeSegment(value: string): unknown {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) throw new Error('JWT segments must use unpadded Base64url.');
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  if (btoa(binary).replace(/=/g, '') !== normalized) throw new Error('JWT contains non-canonical Base64url.');
  const parsed = parseJson(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, char => char.charCodeAt(0))));
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('JWT header and payload must be JSON objects.');
  return parsed;
}
export function decodeJwt(input: string, now = Date.now()): string {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters at a time.');
  const parts = input.trim().replace(/^Bearer\s+/i, '').split('.');
  if (parts.length !== 3 || !/^[A-Za-z0-9_-]*$/.test(parts[2]) || parts[2].length % 4 === 1) throw new Error('Enter a three-part JWT: header.payload.signature. Encrypted tokens are not supported.');
  try {
    const header = decodeSegment(parts[0]);
    const claims = decodeSegment(parts[1]) as Record<string, unknown>;
    const exp = claims['exp'];
    let expiration: Record<string, unknown> = { status: 'not provided' };
    if (Object.hasOwn(claims, 'exp')) {
      const date = typeof exp === 'number' ? new Date(exp * 1000) : null;
      expiration = date && Number.isFinite(date.getTime())
        ? { status: now >= (exp as number) * 1000 ? 'expired' : 'not expired', expiresAt: date.toISOString(), evaluatedAt: new Date(now).toISOString() }
        : { status: 'invalid exp claim; expected Unix seconds' };
    }
    return JSON.stringify({ signatureVerified: false, warning: 'Decoded only. Claims and expiration are untrusted; no signature, issuer, audience, or not-before validation is performed.', header, claims, signaturePresent: parts[2].length > 0, expiration }, null, 2);
  } catch (error) {
    throw new Error(`Could not decode JWT. ${error instanceof Error ? error.message : 'Check the token encoding.'}`);
  }
}
export function parseUrl(input: string): string {
  let url: URL;
  if (!/^https?:\/\//i.test(input.trim())) throw new Error('Enter an absolute HTTP or HTTPS URL, including https://.');
  try { url = new URL(input.trim()); } catch { throw new Error('Enter an absolute HTTP or HTTPS URL, including https://.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.');
  return JSON.stringify({ protocol: url.protocol.slice(0, -1), origin: url.origin, hostname: url.hostname, port: url.port || (url.protocol === 'https:' ? '443' : '80'), pathname: url.pathname, query: [...url.searchParams].map(([name, value]) => ({ name, value })), fragment: url.hash.slice(1), credentialsPresent: !!(url.username || url.password) }, null, 2);
}
export function countWords(input: string): string {
  let words = 0;
  for (const part of new Intl.Segmenter('en', { granularity: 'word' }).segment(input)) if (part.isWordLike) words++;
  let characters = 0, charactersWithoutWhitespace = 0;
  for (const part of new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(input)) {
    characters++;
    if (!/^\s+$/u.test(part.segment)) charactersWithoutWhitespace++;
  }
  return JSON.stringify({ words, characters, charactersWithoutWhitespace, lines: input ? input.split(/\r\n|\r|\n/).length : 0, utf8Bytes: new TextEncoder().encode(input).length, estimatedReadingSeconds: Math.ceil(words / 200 * 60) }, null, 2);
}
