const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const output = resolve(__dirname, '../../.local/previews');
mkdirSync(output, { recursive: true });
const base = process.env.DEVDOCK_BASE_URL || 'http://127.0.0.1:4300';
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1100}, deviceScaleFactor:1});
  await page.goto(base + '/', {waitUntil:'networkidle'});
  await page.screenshot({path:resolve(output, 'landing-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:resolve(output, 'landing-mobile.png'),fullPage:true});
  await page.goto(base + '/tools/base64', {waitUntil:'networkidle'});
  await page.screenshot({path:resolve(output, 'tool-mobile.png'),fullPage:true});
  await browser.close();
})();
