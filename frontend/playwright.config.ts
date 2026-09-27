import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', testMatch: process.env['DEVDOCK_TEST_OUTAGE'] ? 'outage.spec.ts' : ['workspace.spec.ts', 'catalog.spec.ts', 'conversions.spec.ts', 'advanced.spec.ts', 'workflows.spec.ts', 'files.spec.ts'], fullyParallel: false, workers: 1,
  use: { baseURL: process.env['DEVDOCK_BASE_URL'] || 'http://127.0.0.1:4200', headless: true, trace: 'retain-on-failure' },
  reporter: 'list', timeout: 30_000,
});
