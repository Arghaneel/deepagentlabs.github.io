const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.USECASE_PREVIEW_URL||'http://localhost:8793';
(async()=>{
 const browser=await chromium.launch();
 try {
  for(const width of [360,768,1440]){
   const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   assert.equal((await page.goto(base+'/usecases/5/')).status(),200);
   const app=page.locator('[data-sidecar-loop]');
   assert.equal(await app.locator('button,input,select').count(),0);
   assert.equal(await app.locator('[data-ss-check]').count(),4);
   assert.equal(await app.locator('.ss-wires g').count(),8);
   assert.equal(await app.locator('.ss-node-status').count(),8);
   assert.equal(await app.locator('.ss-wire-track').evaluateAll(paths=>paths.every(path=>Number.isFinite(path.getTotalLength())&&path.getTotalLength()>0)),true);
   assert.equal(await app.locator('[data-ss-target]').count(),4);
   assert.match(await app.innerText(),/Static overview/);
   assert.equal(await app.getAttribute('data-phase'),'0');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.deepEqual(errors,[]);
   if(process.env.SIDECAR_SCREENSHOT_DIR&&width===1440)await app.screenshot({path:process.env.SIDECAR_SCREENSHOT_DIR+'/sidecar-loop.png'});
   await page.goto(base+'/usecases/');assert.equal(await page.locator('.uc-card').count(),6);
   await page.locator('.uc-card[href="/usecases/5/"]').click();assert.equal(await app.count(),1);
   console.log('PASS passive Sidecar layout, reduced motion and index at '+width+'px');
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  await page.clock.install({time:new Date('2026-10-21T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-21T12:00:01Z'));
  await page.goto(base+'/usecases/5/');
  const app=page.locator('[data-sidecar-loop]');
  await app.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-sidecar-loop]').classList.contains('ss-playing'));
  for(const key of ['external','mcp','vector','tool']){
   assert.equal(await app.getAttribute('data-call'),key);
   for(const phase of (key==='tool'?[0,1,2,3,4,5,6,7]:[0,1,2,3,5,6,7])){
    assert.equal(await app.getAttribute('data-phase'),String(phase));
    assert.equal(await app.locator('.ss-gate.released').count(),phase>=5?1:0);
    assert.equal(await app.locator('.ss-target.executing').count(),phase>=5?1:0);
    if(key!=='tool'){assert.match(await app.locator('[data-ss-check-status="approval"]').innerText(),/NOT REQUIRED/);assert.equal(await app.locator('[data-ss-check="approval"].active').count(),0);}
    if(phase>=5){if(key==='tool')assert.match(await app.locator('[data-ss-check-status="approval"]').innerText(),/SCRIPTED APPROVAL/);assert.equal(await app.locator('.ss-target.executing').getAttribute('data-ss-target'),key);}
    if(phase===5)assert.equal(await app.locator(`[data-ss-target="${key}"] .ss-node-status`).getAttribute('aria-label'),'Checking');
    if(phase>=6)assert.equal(await app.locator(`[data-ss-target="${key}"] .ss-node-status`).innerText(),'✓');
    if(phase>=5)assert.equal(await app.locator('[data-ss-check="guardrails"] .ss-node-status').innerText(),'✓');
    await page.clock.runFor(1000);
   }
  }
  assert.equal(await app.getAttribute('data-call'),'external');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('[data-ss-playback]').textContent.includes('Static overview'));
  const stoppedPhase=await app.getAttribute('data-phase');
  await page.clock.runFor(4000);
  assert.equal(await app.getAttribute('data-phase'),stoppedPhase);
  console.log('PASS all four call cycles: automated checks precede every execution; only the critical refund requires scripted approval; context resets and reduced motion stops playback');
  await page.close();
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
