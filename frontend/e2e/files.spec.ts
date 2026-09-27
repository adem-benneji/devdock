import { test, expect, type Page, type Download } from '@playwright/test';
import { gzipSync } from 'node:zlib';

async function bytes(download: Download): Promise<Buffer> { const stream = await download.createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(Buffer.from(chunk)); return Buffer.concat(chunks); }
async function upload(page: Page, name: string, data: string | Buffer) {
  await page.locator('#conversion-file').setInputFiles({ name, mimeType: 'application/octet-stream', buffer: typeof data === 'string' ? Buffer.from(data) : data });
  await expect(page.getByText('What would you like to make?', { exact: true })).toBeVisible();
}
async function output(page: Page, label: string) {
  await page.getByRole('group', { name: 'Output format' }).getByRole('button', { name: label, exact: false }).click();
  await page.getByRole('button', { name: /^(Convert file|Extract content)$/ }).click();
  await expect(page.getByText('Your file is ready.', { exact: true })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('link', { name: 'Download file' }).click(); return download;
}

test('file converter is discoverable and distinguishes working sections from planned ones', async ({ page }) => {
  await page.goto('/tools'); await page.getByRole('link', { name: 'Open File Converter' }).click();
  await expect(page.getByRole('heading', { name: 'One file. The right formats.' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Conversion sections' }).getByRole('button')).toHaveCount(9);
  await page.getByRole('button', { name: 'Video Planned', exact: true }).click();
  await expect(page.getByText('These formats cannot be converted yet.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'JSON → YAML', exact: true }).click();
  await upload(page, 'config.json', '{"name":"Ada","active":true}');
  await expect(page.getByRole('button', { name: 'YAML Convert file', exact: true })).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('group', { name: 'Output format' }).getByRole('button', { name: 'CSV', exact: false })).toHaveCount(0);
  const result = await output(page, 'YAML'); expect((await bytes(result)).toString()).toContain('name:'); expect(result.suggestedFilename()).toBe('config.yaml');
});

test('file selection, data-dependent outputs, real download and replace/reset work', async ({ page }) => {
  await page.goto('/tools/file-converter');
  await upload(page, 'users.json', '[{"name":"Ada","id":"001"}]');
  await expect(page.getByRole('button', { name: 'Excel workbook Convert file', exact: true })).toBeVisible();
  const csv = await output(page, 'CSV Convert file'); expect((await bytes(csv)).toString()).toBe('name,id\r\nAda,001\r\n');
  await page.getByRole('button', { name: 'YAML Convert file', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Download file' })).toHaveCount(0);
  await upload(page, 'replaced.env', 'API_URL=https://example.com\nTOKEN="example"\n');
  await expect(page.getByText('users.json', { exact: true })).toHaveCount(0);
  const json = await output(page, 'JSON Convert file'); expect(JSON.parse((await bytes(json)).toString())).toEqual({ API_URL: 'https://example.com', TOKEN: 'example' });
  await page.getByRole('button', { name: 'Convert another file' }).click();
  await expect(page.getByText('Drop your file here', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Output format' })).toHaveCount(0);
});

test('CSV becomes a real XLSX file and can be re-uploaded and converted back', async ({ page }) => {
  await page.goto('/tools/file-converter'); await upload(page, 'table.csv', 'name,id\nAda,001\nLin,002\n');
  const excel = await output(page, 'Excel workbook'); const workbook = await bytes(excel);
  expect(workbook.subarray(0,2).toString()).toBe('PK'); expect(excel.suggestedFilename()).toBe('table.xlsx');
  await upload(page, 'misnamed.zip', workbook);
  await expect(page.locator('.file-summary')).toContainText('XLSX');
  await page.getByText('Advanced options', { exact:true }).click();
  await expect(page.getByLabel('Sheet to export')).toContainText('Converted');
  const result = await output(page, 'JSON Convert file'); expect(JSON.parse((await bytes(result)).toString())).toEqual([{name:'Ada',id:'001'},{name:'Lin',id:'002'}]);
});

test('misnamed images use content detection and resize; native WEBP input is decoded', async ({ page }) => {
  await page.goto('/tools/file-converter');
  const [png, webp] = await page.evaluate(() => { const c = document.createElement('canvas');c.width=40;c.height=20;const ctx=c.getContext('2d')!;ctx.fillStyle='green';ctx.fillRect(0,0,40,20);return [c.toDataURL('image/png').split(',')[1],c.toDataURL('image/webp').split(',')[1]]; });
  await upload(page,'holiday.jpg',Buffer.from(png,'base64'));
  await expect(page.locator('.file-summary')).toContainText('PNG'); await expect(page.locator('.notice')).toContainText('filename extension differs');
  await page.getByRole('button',{name:'JPG Convert file',exact:true}).click();
  await page.getByText('Advanced options',{exact:true}).click();await page.getByLabel('Maximum width (0 keeps original)').fill('20');
  const jpeg = await output(page,'JPG Convert file'); const jpegBytes=await bytes(jpeg);expect([...jpegBytes.subarray(0,2)]).toEqual([255,216]);
  const dimensions = await page.evaluate(async base64 => {const image=await createImageBitmap(await (await fetch('data:image/jpeg;base64,'+base64)).blob());const result=[image.width,image.height];image.close();return result;},jpegBytes.toString('base64'));expect(dimensions).toEqual([20,10]);
  await upload(page,'photo.webp',Buffer.from(webp,'base64'));await expect(page.locator('.file-summary')).toContainText('WEBP');
  const converted=await output(page,'PNG Convert file');expect([...(await bytes(converted)).subarray(0,4)]).toEqual([137,80,78,71]);
});

test('image to PDF, PDF page extraction and archive conversion use real binary outputs', async ({ page }) => {
  await page.goto('/tools/file-converter');
  const png = await page.evaluate(() => {const c=document.createElement('canvas');c.width=20;c.height=10;return c.toDataURL('image/png').split(',')[1];});
  await upload(page,'photo.png',Buffer.from(png,'base64'));
  const pdf = await bytes(await output(page,'PDF image'));expect(pdf.subarray(0,5).toString()).toBe('%PDF-');
  await upload(page,'pages.pdf',pdf);
  const zip = await bytes(await output(page,'PNG page images'));expect(zip.subarray(0,2).toString()).toBe('PK');
  await upload(page,'pages.zip',zip);await expect(page.locator('.formats')).toContainText('1 archive entries');
  const tar=await bytes(await output(page,'TAR archive'));expect(tar.subarray(0,12).toString()).toBe('page-001.png');
  await upload(page,'pages.tar',tar);
  const tgz=await bytes(await output(page,'TAR.GZ archive'));expect([...tgz.subarray(0,2)]).toEqual([31,139]);
});

test('Markdown download is safe HTML and Gzip extraction preserves binary content', async ({ page }) => {
  await page.goto('/tools/file-converter');await upload(page,'readme.md','# Hello\n\n<script>alert(1)</script>');
  const html=(await bytes(await output(page,'HTML document'))).toString();expect(html).toContain('<h1>Hello</h1>');expect(html).not.toContain('<script>');
  const input=Buffer.from([0,1,2,255]);await upload(page,'bytes.gz',gzipSync(input));
  const result=await output(page,'Extract original bytes');expect(await bytes(result)).toEqual(input);expect(result.suggestedFilename()).toBe('bytes.bin');
});

test('invalid files and unsupported conversions preserve the selected file and recover', async ({ page, request }) => {
  await page.goto('/tools/file-converter');
  await page.locator('#conversion-file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
  await expect(page.getByRole('alert')).toContainText('corrupted');await expect(page.locator('.file-summary')).toContainText('broken.json');
  await expect(page.getByRole('group',{name:'Output format'})).toHaveCount(0);
  await page.locator('#conversion-file').setInputFiles({name:'huge.bin',mimeType:'application/octet-stream',buffer:Buffer.alloc(5_000_001)});
  await expect(page.getByRole('alert')).toContainText('up to 5 MB');
  await upload(page,'data.json','{"ok":true}');await expect(page.getByRole('alert')).toHaveCount(0);
  const invalid=await request.post('/api/tools/files/convert?filename=data.json&target=mp3',{data:Buffer.from('{}'),headers:{'Content-Type':'application/octet-stream'}});
  expect(invalid.status()).toBe(422);expect((await invalid.json()).code).toBe('UNSUPPORTED_CONVERSION');
});

test('drop interaction, cancellation/replacement and mobile layout work', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});await page.goto('/tools/file-converter');
  await page.locator('.dropzone').evaluate(element => {const transfer=new DataTransfer();transfer.items.add(new File(['name\tvalue\nAda\t001\n'],'rows.tsv',{type:'text/tab-separated-values'}));element.dispatchEvent(new DragEvent('drop',{dataTransfer:transfer,bubbles:true}));});
  await expect(page.locator('.file-summary')).toContainText('TSV');
  await output(page,'JSON Convert file');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Remove file',exact:true}).click();await expect(page.locator('.file-summary')).toHaveCount(0);
  await page.locator('#conversion-file').setInputFiles({name:'data.json',mimeType:'application/json',buffer:Buffer.from('{"ok":true}')});
  // Cancels whichever phase is current; a late HTTP response must not restore the old selection.
  await page.getByRole('button',{name:/^(Cancel & remove|Remove file)$/}).click();
  await upload(page,'replacement.json','{"next":true}');
  await expect(page.locator('.file-summary')).toContainText('replacement.json');await expect(page.locator('.file-summary')).not.toContainText('data.json');
});

test('XML data downloads and configuration exports use compatible outputs and literal values', async ({ page }) => {
  await page.goto('/tools/file-converter');
  await upload(page, 'catalog.bin', '<catalog><item id="001">Ada &amp; Lin</item><item id="002">Sam</item></catalog>');
  await expect(page.locator('.file-summary')).toContainText('XML');
  const json = await bytes(await output(page, 'JSON Convert file'));
  expect(JSON.parse(json.toString())).toEqual({ catalog: { item: [{ '@id': '001', '#text': 'Ada & Lin' }, { '@id': '002', '#text': 'Sam' }] } });
  await upload(page, 'catalog.json', json);
  const xml = await bytes(await output(page, 'XML data'));
  expect(xml.toString()).toContain('id="001"'); expect(xml.toString()).toContain('Ada &amp; Lin');
  await upload(page, 'settings.json', '{"API_URL":"https://example.com","TOKEN":"literal ${VALUE}","EMPTY":""}');
  const env = await bytes(await output(page, 'ENV configuration'));
  await upload(page, 'settings.env', env);
  const settings = JSON.parse((await bytes(await output(page, 'JSON Convert file'))).toString());
  expect(settings).toEqual({ API_URL: 'https://example.com', TOKEN: 'literal ${VALUE}', EMPTY: '' });
  await upload(page, 'sections.json', '{"database":{"port":"55432","host":"localhost"}}');
  await expect(page.getByRole('button', { name: 'ENV configuration Convert file', exact: true })).toHaveCount(0);
  const ini = await bytes(await output(page, 'INI configuration'));
  expect(ini.toString()).toContain('[database]');
  await upload(page, 'sections.ini', ini);
  expect(JSON.parse((await bytes(await output(page, 'JSON Convert file'))).toString())).toEqual({database:{port:'55432',host:'localhost'}});
});

test('XML validation explains unsupported structures and lets the user replace the file', async ({ page, request }) => {
  await page.goto('/tools/file-converter');
  await page.locator('#conversion-file').setInputFiles({name:'mixed.xml',mimeType:'application/xml',buffer:Buffer.from('<root>before<child/>after</root>')});
  await expect(page.getByRole('alert')).toContainText('Mixed text');
  await expect(page.locator('.file-summary')).toContainText('mixed.xml');
  await upload(page, 'valid.xml', '<root><value>001</value></root>');
  expect(JSON.parse((await bytes(await output(page, 'JSON Convert file'))).toString())).toEqual({root:{value:'001'}});
  const invalid = await request.post('/api/tools/files/convert?filename=config.json&target=env', {data:Buffer.from('{"VALUE":true}'),headers:{'Content-Type':'application/octet-stream'}});
  expect(invalid.status()).toBe(422); expect((await invalid.json()).code).toBe('UNSUPPORTED_CONVERSION');
});

test('7Z and compressed TAR downloads interoperate with independent archive readers', async ({ page }) => {
  const { execFileSync } = await import('node:child_process');
  const source = execFileSync('python3', ['-c', 'import io,tarfile,sys\nb=io.BytesIO()\nwith tarfile.open(fileobj=b,mode="w:xz") as t:\n d=b"Ada\\n001\\n"; e=tarfile.TarInfo("folder/data.txt"); e.size=len(d); t.addfile(e,io.BytesIO(d))\nsys.stdout.buffer.write(b.getvalue())']);
  await page.goto('/tools/file-converter'); await upload(page, 'misnamed.zip', source);
  await expect(page.locator('.file-summary')).toContainText('TXZ');
  const seven = await bytes(await output(page, '7Z archive'));
  expect(seven.subarray(0,6).toString('hex')).toBe('377abcaf271c');
  await upload(page, 'archive.7z', seven);
  const bzip = await output(page, 'TAR.BZ2 archive'); expect(bzip.suggestedFilename()).toBe('archive.tar.bz2');
  const bzipBytes = await bytes(bzip);
  const readTar = (data:Buffer) => execFileSync('python3', ['-c','import io,tarfile,sys\nwith tarfile.open(fileobj=io.BytesIO(sys.stdin.buffer.read()),mode="r:*") as t: sys.stdout.buffer.write(t.extractfile("folder/data.txt").read())'],{input:data}).toString();
  expect(readTar(bzipBytes)).toBe('Ada\n001\n');
  await upload(page, 'my.bundle.tar.bz2', bzipBytes);
  const xz = await output(page, 'TAR.XZ archive'); expect(xz.suggestedFilename()).toBe('my.bundle.tar.xz');
  expect(readTar(await bytes(xz))).toBe('Ada\n001\n');
  const compressed = execFileSync('python3', ['-c','import bz2,sys;sys.stdout.buffer.write(bz2.compress(b"original bytes"))']);
  await upload(page, 'raw.bz2', compressed);
  await expect(page.getByRole('group', {name:'Output format'}).getByRole('button')).toHaveCount(1);
  expect((await bytes(await output(page, 'Extract original bytes'))).toString()).toBe('original bytes');
});
