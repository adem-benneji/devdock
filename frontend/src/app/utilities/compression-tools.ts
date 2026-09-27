import { boundedOutput } from './strict-json';
function decode(input: string): Uint8Array<ArrayBuffer> {
  const value = input.replace(/\s/g, '');
  try {
    const binary = atob(value);
    if (btoa(binary) !== value) throw new Error();
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  } catch { throw new Error('Enter valid, padded Base64 compressed data.'); }
}
function encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return boundedOutput(btoa(binary));
}
export async function compressText(input: string, mode: string): Promise<string> {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters.');
  const [action, format] = mode.split('-');
  if (!['compress', 'decompress'].includes(action) || !['gzip', 'deflate'].includes(format)) throw new Error('Choose Gzip or zlib Deflate compression/decompression.');
  if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined') throw new Error('This browser does not support Compression Streams.');
  const bytes = action === 'compress' ? new TextEncoder().encode(input) : decode(input);
  const stream = action === 'compress' ? new CompressionStream(format as 'gzip') : new DecompressionStream(format as 'gzip');
  const reader = new Blob([bytes]).stream().pipeThrough(stream).getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 1_000_000) { await reader.cancel(); throw new Error('Expanded result exceeds 1,000,000 bytes. Use smaller content.'); }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Expanded result')) throw error;
    throw new Error('Invalid or truncated compressed data, or the selected compression format does not match.');
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  if (action === 'compress') return encode(result);
  try { return boundedOutput(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(result)); }
  catch { throw new Error('Decompressed data is not valid UTF-8 text.'); }
}
