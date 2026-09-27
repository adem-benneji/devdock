import { validateSchema } from './schema-tools';
import { formatSql } from './sql-tools';
import { versionTool } from './version-tools';
import { cidr, editUrl, hmac, pkce } from './protocol-tools';
import { jsonToSchema } from './data-tools';
import { transform } from './transforms';
import { WORKFLOW_GUIDES } from './workflow-guides';

describe('schema validation contracts', () => {
  it('accepts generated schemas and reports exact document paths without coercion', () => {
    const schema = jsonToSchema('{"name":"Ada","age":37}');
    expect(JSON.parse(validateSchema('{"name":"Lin","age":25}', schema, '2020')).valid).toBe(true);
    const result = JSON.parse(validateSchema('{"name":"Lin","age":"25"}', schema, '2020'));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatchObject({ instancePath: '/age', keyword: 'type' });
  });
  it('supports both dialects, boolean schemas, local refs, and formats', () => {
    for (const mode of ['2020', 'draft7']) {
      expect(JSON.parse(validateSchema('1', 'true', mode)).valid).toBe(true);
      expect(JSON.parse(validateSchema('1', 'false', mode)).valid).toBe(false);
      expect(JSON.parse(validateSchema('"bad"', '{"type":"string","format":"email"}', mode)).valid).toBe(false);
      expect(JSON.parse(validateSchema('2', '{"definitions":{"positive":{"type":"integer","minimum":1}},"$ref":"#/definitions/positive"}', mode)).valid).toBe(true);
    }
  });
  it('rejects missing remote references, unknown keywords, async schemas, wrong dialects and duplicate data', () => {
    for (const schema of ['{"$ref":"https://example.com/schema.json"}', '{"typo":true}', '{"$async":true}', '[]']) expect(() => validateSchema('{}', schema, '2020')).toThrow();
    expect(() => validateSchema('{}', '{"$schema":"http://json-schema.org/draft-07/schema#"}', '2020')).toThrow('dialect');
    expect(() => validateSchema('{"x":1,"x":2}', '{}', '2020')).toThrow('duplicate');
  });
});
describe('SQL source formatting', () => {
  it('formats all offered dialects while preserving literal text and comments', () => {
    for (const mode of ['sql', 'postgresql', 'mysql', 'sqlite', 'tsql']) {
      const result = formatSql("select 'from secret' as label -- keep me\nfrom users where id=1;", mode);
      expect(result).toContain('SELECT'); expect(result).toContain("'from secret'"); expect(result).toContain('-- keep me');
      expect(formatSql(result, mode)).toBe(result);
    }
    expect(formatSql('select "userName" from users where id = $1;', 'postgresql')).toContain('$1');
    expect(formatSql('select `name` from users;', 'mysql')).toContain('`name`');
  });
  it('rejects missing input, unknown dialects and unterminated strings', () => {
    expect(() => formatSql('', 'sql')).toThrow(); expect(() => formatSql('select 1', 'bad')).toThrow();
    expect(() => formatSql("select 'unterminated", 'sql')).toThrow();
  });
});
describe('semantic versions', () => {
  it('inspects metadata, increments and compares precedence independently of build labels', () => {
    expect(JSON.parse(versionTool('1.2.3-beta.1+build.7', 'inspect'))).toMatchObject({ prerelease: ['beta', 1], build: ['build', '7'] });
    expect(() => versionTool('9007199254740991.0.0', 'major')).toThrow('numeric range');
    expect(versionTool('1.2.3', 'major')).toBe('2.0.0'); expect(versionTool('1.2.3', 'minor')).toBe('1.3.0'); expect(versionTool('1.2.3', 'patch')).toBe('1.2.4');
    expect(JSON.parse(versionTool('1.0.0+a', 'compare', '1.0.0+b')).precedence).toBe('equal');
    expect(JSON.parse(versionTool('1.0.0-beta.1', 'compare', '1.0.0')).precedence).toBe('lower');
  });
  it('applies npm range rules and rejects malformed versions and ranges', () => {
    expect(JSON.parse(versionTool('1.2.3', 'range', '^1.0.0')).satisfies).toBe(true);
    expect(JSON.parse(versionTool('1.3.0-beta.1', 'range', '^1.0.0')).satisfies).toBe(false);
    for (const v of ['v1.2.3', '1.2', '01.2.3', '1.0.0-01', '9007199254740992.0.0']) expect(() => versionTool(v, 'inspect')).toThrow();
    expect(() => versionTool('1.2.3', 'range', 'nonsense')).toThrow();
  });
});
describe('IPv4 and URL operations', () => {
  it('calculates subnet boundaries and membership across signed integer boundaries', () => {
    expect(JSON.parse(cidr('192.168.1.42/24', '192.168.2.1'))).toMatchObject({ network: '192.168.1.0', netmask: '255.255.255.0', usableHostCount: 254, firstHost: '192.168.1.1', lastHost: '192.168.1.254', membership: { inSubnet: false } });
    expect(JSON.parse(cidr('255.255.255.255/0'))).toMatchObject({ network: '0.0.0.0', totalAddresses: 4294967296, lastAddress: '255.255.255.255' });
    expect(JSON.parse(cidr('10.0.0.1/31'))).toMatchObject({ usableHostCount: 2, firstHost: '10.0.0.0', lastHost: '10.0.0.1' });
    expect(JSON.parse(cidr('10.0.0.1/32'))).toMatchObject({ usableHostCount: 1, firstHost: '10.0.0.1', lastHost: '10.0.0.1' });
  });
  it('rejects invalid octets, leading zeros, IPv6 and prefixes', () => {
    for (const input of ['256.1.1.1/24', '01.2.3.4/24', '::1/128', '1.2.3.4/33', '1.2.3/24', '1.2.3.4/-1']) expect(() => cidr(input)).toThrow();
    expect(() => cidr('1.2.3.4/24', 'x')).toThrow();
  });
  it('preserves duplicate untouched parameters and fragments; handles arrays, deletion and tracking', () => {
    expect(editUrl('https://example.com/?a=1&a=2&b=old#x', 'apply', '{"b":["new","two"],"c":"é"}')).toBe('https://example.com/?a=1&a=2&b=new&b=two&c=%C3%A9#x');
    expect(editUrl('https://example.com/?a=1&UTM_source=x&fbclid=y#x', 'clean', '')).toBe('https://example.com/?a=1#x');
    expect(editUrl('https://example.com/?a=1&b=2', 'apply', '{"a":null,"b":[]}')).toBe('https://example.com/');
    expect(() => editUrl('https://user:secret@example.com/', 'clean', '')).toThrow('credentials');
    expect(() => editUrl('javascript:alert(1)', 'clean', '')).toThrow();
    expect(() => editUrl('https://example.com', 'apply', '{"a":1}')).toThrow();
  });
});
describe('Web Crypto workflows', () => {
  it('matches independent HMAC vectors for every hash and verifies changes', async () => {
    for (const mode of ['sha256', 'sha384', 'sha512']) {
      const guide = WORKFLOW_GUIDES['hmac-signer'][mode];
      const signature = await hmac(guide.exampleInput, mode, 'key');
      expect(signature).toBe(guide.exampleOutput);
      expect(JSON.parse(await hmac(guide.exampleInput, 'verify-' + mode, 'key', signature.toUpperCase())).matches).toBe(true);
      expect(JSON.parse(await hmac(guide.exampleInput + ' ', 'verify-' + mode, 'key', signature)).matches).toBe(false);
    }
    await expect(hmac('x', 'sha256', '')).rejects.toThrow('secret');
    await expect(hmac('x', 'verify-sha256', 'key', 'bad')).rejects.toThrow('64-character');
  });
  it('matches RFC 7636 and generates fresh verifiers whose challenge is reproducible', async () => {
    const result = JSON.parse(await pkce('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wWFOEjXk', 'generate'));
    expect(result.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(JSON.parse(await pkce(result.codeVerifier, 'derive'))).toEqual(result);
    expect(JSON.parse(await pkce('', 'generate')).codeVerifier).not.toBe(result.codeVerifier);
    expect(JSON.parse(await pkce('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'derive')).codeChallenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
    await expect(pkce('short', 'derive')).rejects.toThrow('43');
    await expect(pkce('a'.repeat(43) + ' ', 'derive')).rejects.toThrow();
  });
  it('extends digest modes with standard SHA-384 and SHA-512 vectors', async () => {
    expect(await transform('hash-generator', 'abc', 'sha384')).toBe('cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7');
    expect(await transform('hash-generator', 'abc', 'sha512')).toBe('ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
  });
});
