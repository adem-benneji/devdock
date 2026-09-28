import { test, expect } from '@playwright/test';

const cases = [
  { id: 'regex-tester', modes: [['match', /"count": 2/], ['replace', /^Ada #, Lin #$/]] },
  { id: 'json-diff', modes: [['compare', /"path": "\/active"/]] },
  { id: 'text-diff', modes: [['compare', /"kind": "removed"/]] },
  { id: 'json-lines', modes: [['to-array', /"id": 1/], ['to-lines', /^\{"id":1\}\n\{"id":2\}$/]] },
  { id: 'json-flatten', modes: [['flatten', /"path": \[/], ['unflatten', /"users": \[/]] },
  { id: 'html-entities', modes: [['encode', /^&lt;b&gt;A &amp; B&lt;\/b&gt;$/], ['decode', /^<b>A & B<\/b>$/]] },
  { id: 'json-string', modes: [['escape', /^"Hello \\"Ada\\"\\nWelcome"$/], ['unescape', /^Hello "Ada"\nWelcome$/]] },
  { id: 'text-hex', modes: [['encode', /^48 69 20 f0 9f 91 8b$/], ['decode', /^Hi 👋$/]] },
  { id: 'unicode-inspector', modes: [['inspect', /"codePoint": "U\+1F44B"/], ['NFC', /^café$/], ['NFD', /^cafe\u0301$/], ['NFKC', /^A café$/], ['NFKD', /^A cafe\u0301$/]] },
  { id: 'line-endings', modes: [['inspect', /"crlf": 1/], ['lf', /^first\nsecond\n$/], ['crlf', /^first\nsecond\n$/], ['cr', /^first\nsecond\n$/], ['strip-bom', /^hello$/]] },
  { id: 'password-generator', modes: [['mixed', /^.{24}$/], ['alphanumeric', /^[A-Za-z0-9]{24}$/]] },
  { id: 'slug-generator', modes: [['generate', /^cafe-api-hello-world$/]] },
] as const;
for (const item of cases) {
  test(`${item.id} executes every documented mode on the backend`, async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiCalls.push(request.url()); });
    await page.goto(`/tools/${item.id}`);
    await expect(page.getByText('What to enter', { exact: true })).toBeVisible();
    for (const [mode, result] of item.modes) {
      if (item.modes.length > 1) await page.getByLabel('Operation', { exact: true }).selectOption(mode);
      await page.getByRole('button', { name: 'Load example' }).click();
      await page.getByRole('button', { name: 'Run tool' }).click();
      await expect(page.getByLabel('Result', { exact: true })).toHaveValue(result);
      await expect(page.getByRole('alert')).toHaveCount(0);
    }
    expect(apiCalls.some(url => url.includes('/executions'))).toBe(true);
  });
}

test('secondary editor changes invalidate comparison results and invalid JSON recovers', async ({ page }) => {
  await page.goto('/tools/json-diff');
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"equal": false/);
  await page.getByLabel('Updated JSON').fill('bad json');
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('valid JSON');
  await page.getByLabel('Updated JSON').fill('{"active":false,"name":"Ada"}');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"equal": true/);
});

test('catastrophic regex times out while navigation stays responsive and a later run recovers', async ({ page }) => {
  await page.goto('/tools/regex-tester');
  await page.getByLabel('Text to search').fill('a'.repeat(99000) + '!');
  await page.getByLabel('Regular expression').fill('(a+)+$');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await page.getByRole('button', { name: 'Favorite', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Favorited', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('alert')).toContainText('Execution exceeded its time limit', { timeout: 15000 });
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"count": 2/);
});

test('leaving an active regex cancels the worker and does not leak results into the next tool', async ({ page }) => {
  await page.goto('/tools/regex-tester');
  await page.getByLabel('Text to search').fill('a'.repeat(99000) + '!');
  await page.getByLabel('Regular expression').fill('(a+)+$');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await page.getByRole('link', { name: 'All tools', exact: true }).first().click();
  await page.getByRole('link', { name: 'Open Text Diff' }).click();
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"kind": "added"/);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('HTML decoding stays text and JSON path conflicts are explained', async ({ page }) => {
  await page.goto('/tools/html-entities');
  await page.getByLabel('Operation', { exact: true }).selectOption('decode');
  await page.getByLabel('Text or HTML entities').fill('&lt;img src=x onerror=alert(1)&gt;');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('<img src=x onerror=alert(1)>');
  await expect(page.locator('img')).toHaveCount(0);
  await page.goto('/tools/json-flatten');
  await page.getByLabel('Operation', { exact: true }).selectOption('unflatten');
  await page.getByLabel('JSON document or path entries').fill('[{"path":[1],"value":true}]');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('contiguous');
});

test('all new workspaces fit mobile including the second editor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const { id } of cases) {
    await page.goto(`/tools/${id}`);
    await expect(page.getByText('What you get', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('Cancel stops a backend execution and permits the next operation', async ({ page, request }) => {
  await page.goto('/tools/regex-tester');
  await page.getByLabel('Text to search').fill('a'.repeat(99000) + '!');
  await page.getByLabel('Regular expression').fill('(a+)+$');
  const accepted = page.waitForResponse(response => response.url().endsWith('/regex-tester/executions') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Run tool' }).click();
  const ticket = await (await accepted).json();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Execution cancelled');
  await expect.poll(async () => (await request.get(`/api/tools/executions/${ticket.id}`, { headers: { 'X-Execution-Token': ticket.token } })).status()).toBe(404);
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"count": 2/);
});
