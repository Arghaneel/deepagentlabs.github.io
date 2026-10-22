const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.USECASE_PREVIEW_URL || 'http://127.0.0.1:8793';
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [360, 768, 1440]) {
      const page = await browser.newPage({viewport:{width,height:1000}, reducedMotion:'reduce'});
      const errors=[]; page.on('pageerror', e=>errors.push(e.message));
      await page.goto(`${base}/usecases/3/`);
      assert.equal(await page.locator('[data-loop-stage]').count(),11);
      assert.equal(await page.locator('.ops-figure img').count(),0);
      await page.locator('[data-loop-stage="replay"]').click();
      assert.match(await page.locator('#ops-loop-detail').innerText(), /creates a new execution/);
      await page.locator('[data-loop-stage="evals"]').focus();
      await page.keyboard.press('Enter');
      assert.match(await page.locator('#ops-loop-detail').innerText(), /Evaluation does not itself replay/);
      assert.equal(await page.locator('[data-loop-stage][aria-pressed="true"]').count(),2);
      await page.locator('[data-loop-stage="deploy"]').click();
      assert.match(await page.locator('#ops-loop-detail').innerText(), /no real deployment/);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      const rects = await page.locator('[data-loop-stage]').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,overflow:n.scrollHeight>n.clientHeight+1};}));
      assert.equal(rects.some(r=>r.overflow),false,'stage content fits at '+width);
      for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++) {
        const a=rects[i], b=rects[j];
        assert.equal(a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y,false,'no overlapping stages');
      }
      await page.locator('[data-loop-reset]').click();
      assert.equal(await page.locator('[data-loop-play]').getAttribute('aria-pressed'),'false');
      await page.locator('[data-loop-next]').click();
      assert.match(await page.locator('#ops-loop-detail h3').innerText(), /AgenticLens/);
      await page.locator('[data-loop-reset]').click();
      assert.deepEqual(errors,[]);
      if(width===1440 && process.env.LOOP_SCREENSHOT_DIR) await page.locator('.ops-figure').screenshot({path:`${process.env.LOOP_SCREENSHOT_DIR}/ops-loop.png`});
      console.log('PASS code-rendered loop: stage selection, keyboard, layout at '+width+'px');
      await page.close();
    }
    const animated = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
    await animated.goto(`${base}/usecases/3/`);
    await animated.locator('.ops-controls').scrollIntoViewIfNeeded();
    await animated.waitForFunction(()=>document.querySelector('.ops-figure').classList.contains('ops-playing'));
    await animated.waitForFunction(()=>document.querySelector('[data-loop-stage="lens"]').getAttribute('aria-pressed')==='true');
    await animated.locator('[data-loop-play]').click();
    assert.equal(await animated.locator('.ops-figure').evaluate(el=>el.classList.contains('ops-playing')),false);
    const stage = await animated.locator('.ops-playback-status').innerText();
    await animated.waitForTimeout(3000);
    assert.equal(await animated.locator('.ops-playback-status').innerText(),stage);
    await animated.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await animated.locator('[data-loop-play]').getAttribute('aria-pressed'),'false');
    console.log('PASS autoplay, timed advance, pause and reduced-motion behavior');
    await animated.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
