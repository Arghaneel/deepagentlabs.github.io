// Browser regression checks. Requires Playwright and a local preview server.
// SIMULATION_PREVIEW_URL defaults to http://localhost:8765.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 for(const width of [390,1280]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const open=async path=>{await page.goto((process.env.SIMULATION_PREVIEW_URL || 'http://localhost:8765')+'/'+path+'/');};
  const output=()=>page.locator('.dal-demo-inspector').first().innerText();
  await open('agenticlens');
  await page.getByRole('button',{name:'Generate / model call',exact:true}).click();
  assert.match(await output(),/1,600 input \+ 560 output/);
  await page.getByRole('button',{name:'Show recommendation',exact:true}).click();assert.match(await output(),/Advisory recommendation/);
  await page.locator('[data-tab=gate]').click();await page.locator('#gate-threshold').fill('99');assert.equal(await page.locator('#gate-title').innerText(),'Gate blocked');
  await open('agentic-chaos');
  for(const [value,result] of [['timeout','Passed'],['rate-limit','Passed'],['corrupted','Failed']]){
   await page.locator('.dal-demo select').selectOption(value);
   await page.getByRole('button',{name:'Run fault simulation'}).click();
   await page.waitForFunction(expected=>document.querySelectorAll('[data-sim-metric]')[2].textContent===expected,result);
  }
  await open('agentic-sidecar');
  assert.equal(await page.getByRole('button',{name:'Approve sample action'}).isDisabled(),true);
  await page.locator('.dal-demo select').selectOption('govern');assert.match(await output(),/PAUSE/);
  await page.getByRole('button',{name:'Approve sample action'}).click();assert.match(await output(),/Sample approval recorded/);
  await page.locator('.dal-demo select').selectOption('observe');
  await page.locator('.dal-demo select').selectOption('govern');
  await page.getByRole('button',{name:'Reject sample action'}).click();assert.match(await output(),/remains blocked/);
  await open('agentic-evals');await page.getByRole('button',{name:'Run test suite'}).click();assert.match(await output(),/blocks/);
  await page.locator('input[type=range]').evaluate(el=>{el.value='75';el.dispatchEvent(new Event('input',{bubbles:true}));});assert.match(await output(),/passes/);
  assert.equal(await page.locator('[data-sim-result]').last().innerText(),'FAIL');
  await page.getByText('Inspect failed case: escalation',{exact:true}).click();assert.equal(await page.locator('.dal-demo details').getAttribute('open'),'');
  await open('mcp');await page.locator('.dal-demo select').selectOption('lens.analyze_workflow');await page.getByRole('button',{name:'Run sample call'}).click();
  const result=JSON.parse(await output());assert.equal(result.simulation,true);assert.equal(result.illustrative_result.tokens.input,1600);
  await open('agentic-evals');await page.locator('[data-tab=tab-suite]').click();assert.equal(await page.locator('#tab-suite').isVisible(),true);assert.equal(await page.locator('#tab-simple').isVisible(),false);
  await open('agentic-sidecar');await page.locator('[data-action=read_order]').click();assert.match(await page.locator('#demo-console').innerText(),/ALLOW/);await page.locator('[data-tab=intent]').click();assert.match(await page.locator('#code-display').innerText(),/IntentEnvelope/);
  await open('control-tower');
  await page.getByRole('button',{name:'support-triage',exact:true}).click();
  const before=Number(await page.locator('[data-count=bad]').innerText());
  await page.getByRole('button',{name:'Make selected heartbeat stale'}).click();
  assert.equal(Number(await page.locator('[data-count=bad]').innerText()),before+1);
  await page.getByRole('button',{name:'Make selected heartbeat stale'}).click();
  assert.equal(Number(await page.locator('[data-count=bad]').innerText()),before+1);
  await page.getByLabel('Fleet health filter').selectOption('bad');assert.equal(await page.locator('[data-fleet-rows] li:visible').count(),2);
  await page.getByRole('button',{name:'Send sample heartbeat'}).click();assert.equal(await page.locator('[data-fleet-rows] li:visible').count(),1);
  assert.equal(Number(await page.locator('[data-count=bad]').innerText()),before);
  for(const path of ['agenticlens','agentic-chaos','agentic-sidecar','agentic-evals','mcp','control-tower']){
   await open(path);const card=page.locator('[data-product-simulation], [data-fleet]').first();
   if(path!=='control-tower'){
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('uniform-product')),true);
    assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(242, 240, 233)');
    assert.match(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily),/Bricolage Grotesque/);
    assert.equal(await page.locator('header.site-header').count(),1);
    assert.equal(await page.locator('footer.site-footer').count(),1);
    if(width===390){
     await page.locator('.nav-toggle').click();
     assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true');
     await page.locator('.nav-toggle').click();
    }
   }await card.scrollIntoViewIfNeeded();
   assert.equal(await card.evaluate(el=>el.scrollWidth>el.clientWidth),false,path+' overflow');
  }
  assert.deepEqual(errors,[]);console.log('PASS all six interactive demos at',width);await page.close();
 }
 await browser.close();
})();
