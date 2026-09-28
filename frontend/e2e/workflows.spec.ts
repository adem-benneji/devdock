import { test, expect } from '@playwright/test';
const cases = [
  { id: 'json-schema-validator', modes: [['2020', /"valid": true/], ['draft7', /"valid": true/]] },
  { id: 'sql-formatter', modes: ['sql', 'postgresql', 'mysql', 'sqlite', 'tsql'].map(mode => [mode, /SELECT[\s\S]+FROM[\s\S]+ORDER BY/] as const) },
  { id: 'semver-tool', modes: [['inspect', /"major": 1/], ['major', /^2.0.0$/], ['minor', /^1.3.0$/], ['patch', /^1.2.4$/], ['range', /"satisfies": true/], ['compare', /"precedence": "lower"/]] },
  { id: 'hmac-signer', modes: [['sha256', /^[a-f0-9]{64}$/], ['sha384', /^[a-f0-9]{96}$/], ['sha512', /^[a-f0-9]{128}$/], ['verify-sha256', /"matches": true/], ['verify-sha384', /"matches": true/], ['verify-sha512', /"matches": true/]] },
  { id: 'pkce-generator', modes: [['generate', /"codeChallengeMethod": "S256"/], ['derive', /E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM/]] },
  { id: 'ipv4-cidr', modes: [['calculate', /"usableHostCount": 254/]] },
  { id: 'url-query-editor', modes: [['apply', /^https:\/\/example.com\/search\?q=dev\+dock&tag=api&tag=json#results$/], ['clean', /^https:\/\/example.com\/search\?q=old#results$/]] },
  { id: 'gzip-deflate', modes: [['compress-gzip', /^[A-Za-z0-9+/]+=*$/], ['decompress-gzip', /^Hello DevDock$/], ['compress-deflate', /^[A-Za-z0-9+/]+=*$/], ['decompress-deflate', /^Hello DevDock$/]] },
  { id: 'hash-generator', modes: [['sha256', /^[a-f0-9]{64}$/], ['sha384', /^[a-f0-9]{96}$/], ['sha512', /^[a-f0-9]{128}$/]] },
] as const;
for (const item of cases) test(`${item.id} executes all workflow examples through Spring Boot APIs`, async ({ page }) => {
  const calls: string[] = [];
  page.on('request', req => { if (new URL(req.url()).pathname.startsWith('/api/')) calls.push(req.url()); });
  await page.goto(`/tools/${item.id}`);
  await expect(page.getByText('What to enter', { exact: true })).toBeVisible();
  for (const [mode, result] of item.modes) {
    if (item.modes.length > 1) await page.getByLabel('Operation', { exact: true }).selectOption(mode);
    await page.getByRole('button', { name: 'Load example' }).click();
    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByLabel('Result', { exact: true })).toHaveValue(result);
    await expect(page.getByRole('alert')).toHaveCount(0);
  }
  expect(calls.some(url => url.includes('/executions'))).toBe(true);
});

test('generated schema validates a document; failures give paths and remote refs are not fetched', async ({ page }) => {
  await page.goto('/tools/json-schema-generator');
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"properties"/);
  const schema = await page.getByLabel('Result', { exact: true }).inputValue();
  await page.goto('/tools/json-schema-validator');
  await page.getByLabel('JSON document', { exact: true }).fill('{"name":"Ada"}');
  await page.getByLabel('JSON Schema', { exact: true }).fill(schema);
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"valid": true/);
  await page.getByLabel('JSON document', { exact: true }).fill('{"name":3}');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"instancePath": "\/name"/);
  const requests: string[] = [];
  page.on('request', req => { if (req.url().includes('example.com')) requests.push(req.url()); });
  await page.getByLabel('JSON Schema', { exact: true }).fill('{"$ref":"https://example.com/schema.json"}');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('Remote references are never fetched');
  expect(requests).toEqual([]);
});

test('pathological schema patterns time out while the page responds, then recover', async ({ page }) => {
  await page.goto('/tools/json-schema-validator');
  await page.getByLabel('JSON document', { exact: true }).fill(JSON.stringify('a'.repeat(99000) + '!'));
  await page.getByLabel('JSON Schema', { exact: true }).fill('{"type":"string","pattern":"(a+)+$"}');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await page.getByRole('button', { name: 'Favorite', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Execution exceeded its time limit', { timeout: 15000 });
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"valid": true/);
});

test('compression round trips Unicode and empty strings through both real backend codecs', async ({ page }) => {
  await page.goto('/tools/gzip-deflate');
  for (const format of ['gzip', 'deflate']) for (const input of ['Hello é 👋\nline two', '', '\uFEFFdata']) {
    await page.getByLabel('Operation', { exact: true }).selectOption('compress-' + format);
    await page.getByLabel('Text or compressed Base64').fill(input);
    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/^[A-Za-z0-9+/]+=*$/);
    const compressed = await page.getByLabel('Result', { exact: true }).inputValue();
    await page.getByLabel('Operation', { exact: true }).selectOption('decompress-' + format);
    await page.getByLabel('Text or compressed Base64').fill(compressed);
    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByRole('button', { name: 'Copy result' })).toBeEnabled();
    await expect(page.getByLabel('Result', { exact: true })).toHaveValue(input);
    await expect(page.getByRole('alert')).toHaveCount(0);
  }
});

test('compression rejects malformed data, wrong formats, non-text and excessive expansion', async ({ page }) => {
  await page.goto('/tools/gzip-deflate');
  const [bomb, binary, valid] = await page.evaluate(async () => {
    async function gzip(bytes: Uint8Array<ArrayBuffer>) {
      const buffer = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }
    return Promise.all([gzip(new Uint8Array(1_000_001).fill(65)), gzip(new Uint8Array([255])), gzip(new TextEncoder().encode('hello'))]);
  });
  for (const [input, message, mode] of [
    ['not base64!', 'valid, padded Base64', 'decompress-gzip'],
    [bomb, 'exceeds 1,000,000 bytes', 'decompress-gzip'],
    [binary, 'not valid UTF-8', 'decompress-gzip'],
    [valid, 'does not match', 'decompress-deflate'],
    [valid.slice(0, -4), 'Invalid or truncated', 'decompress-gzip'],
  ]) {
    await page.getByLabel('Operation', { exact: true }).selectOption(mode);
    await page.getByLabel('Text or compressed Base64').fill(input);
    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByRole('alert')).toContainText(message);
    await expect(page.getByLabel('Text or compressed Base64')).toHaveValue(input);
    await expect(page.getByRole('button', { name: 'Copy result' })).toBeDisabled();
  }
});

test('HMAC secrets are masked, changes invalidate output, and altered messages fail verification', async ({ page }) => {
  await page.goto('/tools/hmac-signer');
  await page.getByLabel('Operation', { exact: true }).selectOption('verify-sha256');
  await page.getByRole('button', { name: 'Load example' }).click();
  await expect(page.getByLabel('Secret key (UTF-8 text)')).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"matches": true/);
  await page.getByLabel('Secret key (UTF-8 text)').fill('other key');
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"matches": false/);
  await page.reload();
  await expect(page.getByLabel('Secret key (UTF-8 text)')).toHaveValue('');
});

test('new workflow forms fit mobile screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const item of cases) {
    await page.goto(`/tools/${item.id}`);
    await expect(page.getByText('What you get', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
