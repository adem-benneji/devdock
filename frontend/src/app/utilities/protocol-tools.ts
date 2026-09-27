import { boundedOutput, parseJson } from './strict-json';

function ipNumber(value: string): number {
  const parts = value.split('.');
  if (parts.length !== 4 || parts.some(part => !/^(0|[1-9]\d{0,2})$/.test(part) || Number(part) > 255)) throw new Error('Enter four IPv4 octets from 0 to 255, without leading zeros.');
  return parts.reduce((result, part) => result * 256 + Number(part), 0);
}
function ipString(value: number): string {
  return [24, 16, 8, 0].map(shift => Math.floor(value / 2 ** shift) % 256).join('.');
}
export function cidr(input: string, member = ''): string {
  const parts = input.trim().split('/');
  if (parts.length !== 2 || !/^(0|[1-9]\d?)$/.test(parts[1]) || Number(parts[1]) > 32) throw new Error('Enter IPv4/prefix, such as 192.168.1.42/24. Prefix must be 0–32.');
  const address = ipNumber(parts[0]), prefix = Number(parts[1]), size = 2 ** (32 - prefix);
  const network = Math.floor(address / size) * size, last = network + size - 1;
  const result = { inputAddress: parts[0], cidr: `${ipString(network)}/${prefix}`, network: ipString(network), lastAddress: ipString(last), netmask: ipString(2 ** 32 - size), wildcard: ipString(size - 1), totalAddresses: size, usableHostCount: prefix >= 31 ? size : size - 2, firstHost: ipString(prefix >= 31 ? network : network + 1), lastHost: ipString(prefix >= 31 ? last : last - 1) };
  if (!member.trim()) return JSON.stringify(result, null, 2);
  const test = ipNumber(member.trim());
  return JSON.stringify({ ...result, membership: { address: member.trim(), inSubnet: test >= network && test <= last } }, null, 2);
}
export function editUrl(input: string, mode: string, changes: string): string {
  let url: URL;
  try {
    if (!/^https?:\/\//i.test(input.trim())) throw new Error();
    url = new URL(input.trim());
  } catch { throw new Error('Enter an absolute HTTP or HTTPS URL.'); }
  if (url.username || url.password) throw new Error('Remove embedded credentials before editing this URL.');
  if (mode === 'clean') {
    for (const key of [...url.searchParams.keys()]) if (/^utm_/i.test(key) || /^(gclid|dclid|fbclid|msclkid|igshid)$/i.test(key)) url.searchParams.delete(key);
  } else if (mode === 'apply') {
    const value = parseJson(changes);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Parameter edits must be a JSON object: strings set values, string arrays repeat them, null deletes.');
    for (const [key, item] of Object.entries(value)) {
      if (item !== null && typeof item !== 'string' && !(Array.isArray(item) && item.every(v => typeof v === 'string'))) throw new Error('Parameter values must be strings, string arrays, or null.');
      url.searchParams.delete(key);
      for (const entry of item === null ? [] : Array.isArray(item) ? item : [item]) url.searchParams.append(key, entry);
    }
  } else throw new Error('Choose Apply edits or Remove tracking parameters.');
  return boundedOutput(url.href);
}
function cryptoApi(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) throw new Error('This tool needs Web Crypto in a secure context (localhost or HTTPS).');
  return crypto.subtle;
}
function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
export async function pkce(input: string, mode: string): Promise<string> {
  const subtle = cryptoApi();
  const verifier = mode === 'generate' ? base64url(crypto.getRandomValues(new Uint8Array(32))) : input;
  if (!['generate', 'derive'].includes(mode) || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) throw new Error('A PKCE verifier must contain 43–128 ASCII letters, digits, or . _ ~ - characters.');
  const challenge = await subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return JSON.stringify({ codeVerifier: verifier, codeChallenge: base64url(new Uint8Array(challenge)), codeChallengeMethod: 'S256' }, null, 2);
}
export async function hmac(input: string, mode: string, secret: string, signature = ''): Promise<string> {
  if (!secret || secret.length > 4096) throw new Error('Enter a UTF-8 secret of 1–4,096 characters. Spaces are significant.');
  const hash = { sha256: 'SHA-256', sha384: 'SHA-384', sha512: 'SHA-512' }[mode.replace(/^verify-/, '')];
  if (!hash) throw new Error('Choose a supported HMAC algorithm.');
  const subtle = cryptoApi(), verify = mode.startsWith('verify-');
  const key = await subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash }, false, [verify ? 'verify' : 'sign']);
  const bytes = new TextEncoder().encode(input);
  if (verify) {
    const hex = signature.trim(), length = Number(hash.slice(4)) / 4;
    if (hex.length !== length || !/^[a-f\d]+$/i.test(hex)) throw new Error(`Enter a ${length}-character hexadecimal signature, without a prefix.`);
    const given = Uint8Array.from(hex.match(/../g)!, pair => Number.parseInt(pair, 16));
    return JSON.stringify({ algorithm: `HMAC-${hash}`, matches: await subtle.verify('HMAC', key, given, bytes) }, null, 2);
  }
  const digest = await subtle.sign('HMAC', key, bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
