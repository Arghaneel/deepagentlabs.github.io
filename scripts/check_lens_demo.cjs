// Requires Playwright and a static preview server at USECASE_PREVIEW_URL.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.USECASE_PREVIEW_URL || 'http://127.0.0.1:8793';
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [360, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const response = await page.goto(`${base}/usecases/4`);
      assert.equal(response.status(), 200);
      const app = page.locator('[data-lens]');
      const inspector = () => app.locator('.ld-inspector');
      const view = () => app.locator('#ld-view').innerText();
      const openTab = key => app.locator(`[data-tab="${key}"]`).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.match(await inspector().innerText(), /TimeoutError/);
      assert.equal(await app.locator('.ld-graph-node').count(), 19);
      for (const [span, text] of [['mcp','MCP server'], ['vector','Vector database'], ['web','delivery notices'], ['external','CRM REST API']]) {
        await app.locator(`.ld-graph-node[data-span="${span}"]`).click();
        assert.match(await inspector().innerText(), new RegExp(text));
      }
      const orderBranch = app.locator('.ld-graph-node[data-span="order"]').locator('..');
      assert.equal(await orderBranch.locator('.ld-graph-node[data-span="resolution"]').count(), 1);
      await app.locator('[data-span="order"]').first().click();
      assert.match(await inspector().innerText(), /order-specialist/);
      assert.match(await inspector().innerText(), /Subtree tokens\s+1,940/);
      assert.match(await inspector().innerText(), /Own tokens\s+0/);
      await app.locator('[data-span="response"]').click();
      assert.match(await inspector().innerText(), /Own tokens\s+840/);
      await openTab('tokens');
      assert.match(await view(), /2,840/);
      const totals = await app.locator('.ld-table tbody tr').first().locator('td').allTextContents();
      assert.deepEqual(totals.slice(1, 4), ['300', '100', '400']);
      await app.locator('[data-evidence="classify"]').click();
      assert.match(await inspector().innerText(), /demo-small/);
      await openTab('diagnostics');
      assert.match(await view(), /58.5%/);
      await app.locator('[data-evidence="retry"]').click();
      assert.match(await inspector().innerText(), /attempt/);
      await openTab('compare');
      assert.match(await view(), /−3 traces/);
      await app.locator('[data-show-trace]').click();
      assert.match(await view(), /ns-1043/);
      await openTab('tokens');
      assert.match(await view(), /2,340/);
      await openTab('diagnostics');
      assert.match(await view(), /cached evidence/);
      assert.doesNotMatch(await view(), /Carrier timeout dominates/);
      await app.locator('[data-filter="range"]').selectOption('15');
      assert.equal(await app.locator('.ld-trace-list button').count(), 3);
      await app.locator('[data-filter="status"]').selectOption('errors');
      assert.equal(await app.locator('.ld-trace-list button').count(), 2);
      await app.locator('[data-search]').fill('ns-1044');
      assert.equal(await app.locator('.ld-trace-list button').count(), 1);
      assert.match(await app.locator('.ld-metrics').innerText(), /2,840/);
      await app.locator('[data-search]').fill('missing-trace');
      assert.equal(await app.locator('.ld-trace-list button').count(), 0);
      assert.equal(await app.locator('[data-export]').isDisabled(), true);
      assert.match(await app.innerText(), /No traces match/);
      await app.locator('[data-reset]').click();
      assert.equal(await app.locator('.ld-trace-list button').count(), 6);
      await openTab('traces');
      await app.locator('[data-tab="traces"]').press('ArrowRight');
      assert.equal(await app.locator('[data-tab="tokens"]').getAttribute('aria-selected'), 'true');
      const downloadEvent = page.waitForEvent('download');
      await app.locator('[data-export]').click();
      const download = await downloadEvent;
      assert.equal(download.suggestedFilename(), 'agenticlens-ns-1042-demo.json');
      const stream = await download.createReadStream();
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const data = JSON.parse(Buffer.concat(chunks).toString());
      assert.equal(data.simulation, true);
      assert.equal(data.totals.input + data.totals.output, 2840);
      assert.equal(data.spans.filter(s => s.type === 'model').reduce((sum, s) => sum+s.input+s.output, 0), 2840);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(errors, []);
      await page.goto(`${base}/usecases/`);
      assert.equal(await page.locator('.uc-card').count(), 6);
      await page.locator('.uc-card[href="/usecases/4/"]').click();
      assert.equal(await page.locator('[data-lens]').count(), 1);
      if (process.env.LENS_SCREENSHOT_DIR && width === 1440) {
        await page.screenshot({ path: `${process.env.LENS_SCREENSHOT_DIR}/lens-dashboard.png`, fullPage: true });
      }
      console.log(`PASS AgenticLens: spans, token totals, diagnostics, filters, comparison, export and responsive layout at ${width}px`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
