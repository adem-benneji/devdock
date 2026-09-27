import { test, expect } from '@playwright/test';

test('landing discovery, collections and persistent favorites work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Less busywork. More building.' })).toBeVisible();
  await expect(page.locator('.tool-card')).toHaveCount(39);
  await page.getByRole('button', { name: 'Favorite UUID Generator', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Unfavorite UUID Generator', exact: true })).toBeVisible();
  await page.getByLabel('Search tools', { exact: true }).fill('uuid');
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await page.getByLabel('Search tools', { exact: true }).fill('does not exist');
  await expect(page.getByRole('heading', { name: 'No tools found. Yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all tools' }).click();
  await page.getByRole('button', { name: 'Security', exact: true }).click();
  await expect(page.locator('.tool-card')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Open SHA Hash Generator' })).toBeVisible();
  await page.getByRole('link', { name: 'Favorites 1', exact: true }).click();
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Open UUID Generator' })).toBeVisible();
});

test('all six local utility modules execute real transformations', async ({ page }) => {
  await page.goto('/tools/base64');
  await page.getByLabel('Text or Base64 input').fill('Hello 👋');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('SGVsbG8g8J+Riw==');
  await page.getByLabel('Operation', { exact: true }).selectOption('decode');
  await page.getByLabel('Text or Base64 input').fill('SGVsbG8g8J+Riw==');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('Hello 👋');
  await page.goto('/tools/hash-generator');
  await page.getByLabel('Text to hash').fill('hello');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  await page.goto('/tools/uuid-generator');
  await page.getByLabel('Number of UUIDs').fill('3');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/^[^\n]+\n[^\n]+\n[^\n]+$/);
  const uuids = (await page.getByLabel('Result', { exact: true }).inputValue()).split('\n');
  expect(new Set(uuids).size).toBe(3);
  for (const uuid of uuids) expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  await page.goto('/tools/unix-timestamp');
  await page.getByLabel('Timestamp or UTC date').fill('0');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('1970-01-01T00:00:00.000Z');
  await page.goto('/tools/url-codec');
  await page.getByLabel('URL component').fill('hello world&');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('hello%20world%26');
  await page.goto('/tools/case-converter');
  await page.getByLabel('Text to convert').fill('hello-world');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('helloWorld');
});

test('mobile navigation and catalog fit a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'All tools', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find your next shortcut.' })).toBeVisible();
  await page.getByRole('link', { name: 'Open Base64 Encoder' }).click();
  await expect(page.getByRole('heading', { name: 'Base64 Encoder', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('leaving unsaved JSON via the new navigation asks before discarding', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  await page.getByLabel('JSON input').fill('{"unsaved":true}');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('link', { name: 'DevDock home' }).click();
  await expect(page).toHaveURL(/tools\/json-formatter/);
  await expect(page.getByLabel('JSON input')).toHaveValue('{"unsaved":true}');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('link', { name: 'DevDock home' }).click();
  await expect(page.getByRole('heading', { name: 'Less busywork. More building.' })).toBeVisible();
});

test('new catalog tools run real examples and expose usage guidance', async ({ page }) => {
  const cases = [
    ['jsonpath-tester', /"count": 2/],
    ['json-to-typescript', /export type Root =/],
    ['json-schema-generator', /"\$schema": "https:\/\/json-schema.org\/draft\/2020-12\/schema"/],
    ['jwt-decoder', /"signatureVerified": false/],
    ['url-parser', /"hostname": "example.com"/],
    ['word-counter', /"words": 2/],
  ] as const;
  const calls: string[] = [];
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) calls.push(request.url()); });
  for (const [id, expected] of cases) {
    await page.goto(`/tools/${id}`);
    await expect(page.getByText('What to enter', { exact: true })).toBeVisible();
    await expect(page.getByText('What you get', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Load example' }).click();
    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByLabel('Result', { exact: true })).toHaveValue(expected);
    await expect(page.getByRole('alert')).toHaveCount(0);
  }
  expect(calls).toEqual([]);
});

test('JSONPath worker handles invalid paths and recovers with a new query', async ({ page }) => {
  await page.goto('/tools/jsonpath-tester');
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByLabel('JSONPath expression').fill('$.users[?(@.name)]');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('Filters and scripts are disabled');
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
  await page.getByLabel('JSONPath expression').fill('$.users[0].name');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"value": "Ada"/);
  await page.getByLabel('JSON document').fill('{"x":1,"x":2}');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('duplicate');
});

test('examples follow the selected mode and guides fit mobile tool pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/base64');
  await page.getByLabel('Operation', { exact: true }).selectOption('decode');
  await page.getByRole('button', { name: 'Load example' }).click();
  await expect(page.getByLabel('Text or Base64 input')).toHaveValue('SGVsbG8=');
  await expect(page.getByLabel('Operation', { exact: true })).toHaveValue('decode');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('Hello');
  for (const id of ['jsonpath-tester', 'jwt-decoder', 'json-formatter', 'hash-generator']) {
    await page.goto(`/tools/${id}`);
    await expect(page.getByText('What to enter', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('expensive JSONPath queries time out without blocking the page, then recover', async ({ page }) => {
  await page.goto('/tools/jsonpath-tester');
  await page.getByLabel('JSON document').fill('{"child":'.repeat(35) + '0' + '}'.repeat(35));
  await page.getByLabel('JSONPath expression').fill('$' + '..*'.repeat(16) + '.missing');
  await page.getByRole('button', { name: 'Run tool' }).click();
  // This runs on the main thread while the real worker evaluates the query.
  await expect(page.getByRole('button', { name: 'Working…' })).toBeDisabled();
  await page.getByRole('button', { name: 'Favorite', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Favorited', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('alert')).toContainText('Query exceeded 3 seconds', { timeout: 6000 });
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"count": 2/);
});
