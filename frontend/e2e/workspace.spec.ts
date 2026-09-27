import { test, expect } from '@playwright/test';

test('real browser formats, persists across refresh, updates and deletes a snippet', async ({ page }) => {
  const title = `Browser ${crypto.randomUUID()}`;
  await page.goto('/tools/json-formatter');
  await expect(page.getByRole('heading', { name: 'JSON Formatter' })).toBeVisible();
  await page.getByLabel('JSON input').fill('{"number":12345678901234567890,"enabled":true}');
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue(/12345678901234567890/);
  await page.getByLabel('Snippet title').fill(title);
  await page.getByRole('button', { name: 'Save snippet', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Snippet saved.' })).toBeVisible();
  await page.reload();
  await page.getByRole('button').filter({ has: page.getByText(title, { exact: true }) }).click();
  await expect(page.getByLabel('JSON input')).toHaveValue(/12345678901234567890/);
  await page.getByLabel('JSON input').fill('{"updated":true}');
  await expect(page.getByRole('button', { name: 'Update snippet' })).toBeDisabled();
  await page.getByRole('button', { name: 'Minify JSON' }).click();
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('{"updated":true}');
  await page.getByRole('button', { name: 'Update snippet' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Snippet saved.' })).toBeVisible();
  await page.reload();
  await page.getByRole('button').filter({ has: page.getByText(title, { exact: true }) }).click();
  await expect(page.getByLabel('JSON input')).toHaveValue('{"updated":true}');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete snippet' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Snippet deleted.' })).toBeVisible();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
});

test('invalid JSON and title validation preserve the editor and cannot save stale output', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  await page.getByLabel('JSON input').fill('{"valid":true}');
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save snippet', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Save snippet', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Give this snippet a title.');
  await page.getByLabel('JSON input').fill('{bad json');
  await expect(page.getByRole('button', { name: 'Save snippet', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid JSON');
  await expect(page.getByLabel('JSON input')).toHaveValue('{bad json');
  await expect(page.getByLabel('Result', { exact: true })).toHaveValue('');
});

test('stale browser edits show conflict and can reopen the latest persisted version', async ({ page, request }) => {
  const created = await request.post('/api/snippets', { data: { title: `Conflict ${crypto.randomUUID()}`, content: '{}', language: 'JSON' } });
  expect(created.status()).toBe(201);
  const snippet = await created.json();
  try {
    await page.goto('/tools/json-formatter');
    await page.getByRole('button').filter({ has: page.getByText(snippet.title, { exact: true }) }).click();
    await expect(page.getByLabel('JSON input')).toHaveValue('{}');
    const changed = await request.put(`/api/snippets/${snippet.id}`, { data: { title: snippet.title, content: '{"new":true}', language: 'JSON', version: 0 } });
    expect(changed.status()).toBe(200);
    await page.getByLabel('Snippet title').fill(`${snippet.title} edited`);
    await page.getByRole('button', { name: 'Update snippet' }).click();
    await expect(page.getByRole('alert')).toContainText('This snippet changed.');
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Reopen latest version' }).click();
    await expect(page.getByLabel('JSON input')).toHaveValue('{"new":true}');
  } finally {
    await request.delete(`/api/snippets/${snippet.id}?version=1`);
  }
});
