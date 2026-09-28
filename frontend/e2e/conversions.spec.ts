import { test, expect } from '@playwright/test';

const examples = [
  { id: 'csv-json', modes: [['to-json', /"id": "001"/], ['to-csv', /name,id\nAda,001\nLin,002/]] },
  { id: 'yaml-json', modes: [['to-json', /"active": true/], ['to-yaml', /name: Ada\nactive: true\nroles:\n  - developer/]] },
  { id: 'markdown-table', modes: [['generate', /\| name \| role \|\n\| --- \| --- \|\n\| Ada \| Developer \|/]] },
  { id: 'line-toolkit', modes: [['unique', /^apple\nbanana$/], ['sort', /^apple\nbanana\npear$/], ['reverse', /^third\nsecond\nfirst$/], ['trim', /^apple\nbanana$/], ['nonblank', /^apple\nbanana$/]] },
  { id: 'number-base-converter', modes: [['decimal', /"hexadecimal": "FF"/], ['hex', /"decimal": "255"/], ['binary', /"octal": "377"/], ['octal', /"binary": "11111111"/]] },
] as const;

for (const example of examples) {
  test(`${example.id} runs every example in the selected mode through Spring Boot APIs`, async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiCalls.push(request.url()); });
    await page.goto(`/tools/${example.id}`);
    await expect(page.getByText('What to enter', { exact: true })).toBeVisible();
    for (const [mode, result] of example.modes) {
      if (example.modes.length > 1) await page.getByLabel('Operation', { exact: true }).selectOption(mode);
      await page.getByRole('button', { name: 'Load example' }).click();
      await page.getByRole('button', { name: 'Run tool' }).click();
      await expect(page.getByLabel('Result', { exact: true })).toHaveValue(result);
      await expect(page.getByRole('alert')).toHaveCount(0);
    }
    expect(apiCalls.some(url => url.includes('/executions'))).toBe(true);
  });
}

test('CSV and YAML report invalid inputs and recover without stale output', async ({ page }) => {
  await page.goto('/tools/csv-json');
  await page.getByLabel('CSV or JSON input').fill('id,id\n1,2');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('unique');
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"name": "Ada"/);
  await page.getByLabel('Operation', { exact: true }).selectOption('to-csv');
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
  await page.goto('/tools/yaml-json');
  for (const input of ['x: &x [*x]', 'x: !custom test', 'x: 1\nx: 2']) {
    await page.getByLabel('YAML or JSON input').fill(input);
    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Run tool' })).toBeEnabled();
  }
  await page.getByRole('button', { name: 'Load example' }).click();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"active": true/);
});

test('large integers stay exact and markup stays source text', async ({ page }) => {
  await page.goto('/tools/number-base-converter');
  await page.getByLabel('Integer to convert').fill('9007199254740993');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/"hexadecimal": "20000000000001"/);
  await page.getByLabel('Integer to convert').fill('1.5');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('valid base-10');
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
  await page.goto('/tools/markdown-table');
  await page.getByLabel('CSV table').fill('html,note\n<img src=x onerror=alert(1)>,a|b');
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/&lt;img src=x onerror=alert\(1\)&gt;/);
  await expect(page.locator('img')).toHaveCount(0);
});

test('new tools are discoverable and usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools?q=yaml');
  await page.getByRole('link', { name: 'Open YAML ↔ JSON' }).click();
  await expect(page.getByRole('heading', { name: 'YAML ↔ JSON', exact: true })).toBeVisible();
  for (const { id } of examples) {
    await page.goto(`/tools/${id}`);
    await expect(page.getByText('What you get', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
