import { test, expect } from '@playwright/test';

test('unavailable services show useful errors without losing input or leaving actions busy', async ({ page }) => {
  await page.goto('/tools/json-formatter');
  await expect(page.getByRole('alert')).toContainText('The requested service is unavailable.');
  await expect(page.getByRole('button', { name: 'Refresh library' })).toBeEnabled();
  await page.getByLabel('JSON input').fill('{"keep":"this input"}');
  await page.getByRole('button', { name: 'Format JSON', exact: true }).click();
  await expect(page.locator('section').getByRole('alert')).toContainText('The requested service is unavailable.');
  await expect(page.getByLabel('JSON input')).toHaveValue('{"keep":"this input"}');
  await expect(page.getByRole('button', { name: 'Format JSON', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Save snippet', exact: true })).toBeDisabled();
});

test('file converter reports actual service outage and keeps the original selection', async ({ page }) => {
  await page.goto('/tools/file-converter');
  await expect(page.getByRole('alert')).toContainText('Could not load the converter');
  await page.locator('#conversion-file').setInputFiles({name:'keep.json',mimeType:'application/json',buffer:Buffer.from('{"keep":true}')});
  await expect(page.getByRole('alert')).toContainText('The requested service is unavailable.');
  await expect(page.locator('.file-summary')).toContainText('keep.json');
  await expect(page.getByRole('button',{name:'Remove file',exact:true})).toBeEnabled();
});
