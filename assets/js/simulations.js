/* Illustrative browser-only product demos. No requests, credentials or runtime actions. */
(() => {
  document.querySelectorAll('[data-product-simulation]').forEach(card => {
    const frames = JSON.parse(card.querySelector('[data-sim-frames]').textContent);
    const rows = [...card.querySelectorAll('[data-sim-row]')];
    const metrics = [...card.querySelectorAll('[data-sim-metric]')];
    const toggle = card.querySelector('[data-sim-toggle]');
    const next = card.querySelector('[data-sim-next]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let playing = !reduced.matches, visible = true, frame = 0;
    const render = () => {
      const state = frames[frame];
      metrics.forEach((el, i) => { el.textContent = state.metrics[i]; });
      rows.forEach((row, i) => {
        const item = state.rows[i];
        row.querySelector('[data-sim-result]').textContent = item[0];
        row.querySelector('[data-sim-detail]').textContent = item[1];
        row.dataset.tone = item[2];
        row.style.setProperty('--span-start', `${item[3] || 0}%`);
        row.style.setProperty('--span-width', `${item[4] ?? 100}%`);
      });
      card.querySelector('[data-sim-event]').textContent = state.event;
      card.querySelector('[data-sim-step]').textContent = `${frame + 1} / ${frames.length}`;
    };
    card.addEventListener('simulation:seek', event => {
      playing = false; frame = event.detail; render(); updateControl();
    });
    const updateControl = () => {
      toggle.textContent = playing ? 'Pause demo' : 'Play demo';
      toggle.setAttribute('aria-pressed', String(playing));
      card.dataset.playing = String(playing);
    };
    toggle.addEventListener('click', () => { playing = !playing; updateControl(); });
    next.addEventListener('click', () => { playing = false; updateControl(); frame = (frame + 1) % frames.length; render(); });
    reduced.addEventListener('change', () => { playing = !reduced.matches; updateControl(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(card);
    setInterval(() => {
      if (!playing || !visible || document.hidden || card.contains(document.activeElement)) return;
      frame = (frame + 1) % frames.length;
      render();
    }, 2800);
    card.querySelector('[data-sim-controls]').hidden = false;
    render(); updateControl();
  });
})();

/* Hands-on scenarios share the illustrative data, and pause the guided playback. */
(() => {
  const make = (tag, text, parent, attrs = {}) => {
    const el = document.createElement(tag);
    el.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    parent.append(el);
    return el;
  };
  document.querySelectorAll('[data-product-simulation]').forEach(card => {
    const key = card.dataset.productSimulation;
    const panel = make('div', '', card, {class:'dal-demo-try'});
    card.querySelector('.dal-demo-note').before(panel);
    make('small', 'TRY IT YOURSELF', panel);
    const controls = make('div', '', panel, {class:'dal-demo-inputs'});
    const output = make('div', 'Choose an action above to explore this example.', panel, {class:'dal-demo-inspector', role:'status', 'aria-live':'polite'});
    const pause = () => {
      const toggle = card.querySelector('[data-sim-toggle]');
      if (toggle.getAttribute('aria-pressed') === 'true') toggle.click();
    };
    const show = text => { pause(); output.textContent = text; };
    const completeTrace = () => card.dispatchEvent(new CustomEvent('simulation:seek', {detail:2}));
    const button = (text, fn) => {
      const el = make('button', text, controls, {type:'button'});
      el.addEventListener('click', fn);
      return el;
    };
    const select = (label, options) => {
      const wrapper = make('label', label+' ', controls);
      const el = make('select', '', wrapper);
      options.forEach(([value, text]) => make('option', text, el, {value}));
      return el;
    };
    const rows = [...card.querySelectorAll('[data-sim-row]')];
    const metrics = [...card.querySelectorAll('[data-sim-metric]')];
    const setRow = (i, result, detail, tone) => {
      rows[i].querySelector('[data-sim-result]').textContent = result;
      rows[i].querySelector('[data-sim-detail]').textContent = detail;
      rows[i].dataset.tone = tone;
    };
    if (key === 'lens') {
      const steps = [
        ['Plan / delegate', '120 ms · 0 tokens · $0.0000\nParent: workflow root. Finding: no issue in this example.'],
        ['Retrieve / search_docs', '380 ms · 0 tokens · $0.0000\nParent: research agent. Finding: 6 documents retrieved; 2 overlapping passages add redundant context.'],
        ['Generate / model call', '1,280 ms · 1,600 input + 560 output tokens · $0.0041 (illustrative)\nParent: research agent. Finding: 68% of run latency; context includes overlapping passages.'],
        ['Respond', '100 ms · 0 additional tokens · $0.0000\nParent: workflow root. Finding: response delivered successfully.'],
      ];
      steps.forEach(([name, detail], i) => {
        const step = make('button', name, rows[i].firstElementChild, {type:'button','aria-pressed':'false'});
        // Replace the original row label with a keyboard-accessible inspector trigger.
        rows[i].firstElementChild.firstChild.remove();
        step.addEventListener('click', () => {
          rows.forEach(row => row.querySelector('button').setAttribute('aria-pressed','false'));
          step.setAttribute('aria-pressed','true'); completeTrace(); show(name+'\n'+detail);
        });
      });
      button('Show recommendation', () => { completeTrace(); show('Advisory recommendation\nInspect the overlapping retrieval passages before llm.generate. Removing duplicate context may reduce the 1,600 input tokens. Validate quality and latency on repeated runs before changing the workflow. No changes are applied.'); });
    }
    if (key === 'chaos') {
      const fault = select('Fault', [['timeout','Tool timeout'],['rate-limit','Rate limit'],['corrupted','Corrupted output']]);
      let timer;
      button('Run fault simulation', () => {
        pause(); clearTimeout(timer);
        const selected = fault.value;
        const scenarios = {
          timeout: {reason:'TIMEOUT',retry:'TIMEOUT',outcome:'recovered',contract:'PASS',text:'The search tool timed out, then its retry timed out. Cached documents supplied a fallback. Bounded recovery passed.'},
          'rate-limit': {reason:'429 LIMIT',retry:'recovered',outcome:'not needed',contract:'PASS',text:'Provider rate limit injected. After a simulated backoff, the retry succeeded. Fallback was not needed.'},
          corrupted: {reason:'INVALID JSON',retry:'INVALID JSON',outcome:'unavailable',contract:'FAIL',text:'Corrupted output failed schema validation twice. No valid cached response was available; the run failed safely.'},
        };
        const s = scenarios[selected];
        metrics.forEach((el,i) => { el.textContent = ['1','0','Pending'][i]; });
        setRow(0,s.reason,'fault injected','bad'); setRow(1,'queued','retry pending','muted'); setRow(2,'standby','fallback','muted');setRow(3,'pending','recovery check','muted');
        output.textContent = 'Injecting '+fault.selectedOptions[0].text+' into the sample tool call…';
        timer = setTimeout(() => {
          metrics[1].textContent = '1'; metrics[2].textContent = s.contract === 'PASS' ? 'Passed' : 'Failed';
          setRow(1,s.retry,'attempt 2',s.retry === 'recovered'?'ok':'warn');
          setRow(2,s.outcome,'cached_docs',s.outcome==='recovered'?'ok':'muted');
          setRow(3,s.contract,'recovery contract',s.contract==='PASS'?'ok':'bad');
          output.textContent = s.text;
          card.querySelector('[data-sim-event]').textContent = s.text;
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800);
      });
    }
    if (key === 'sidecar') {
      make('p', 'Intent: “Check my refund eligibility; ask before issuing a refund.”\nPlan: look up order → check policy → issue $120 refund → draft response.\nProposed call: issue_refund(order_482, 120).', panel, {class:'dal-demo-context'});
      const mode = select('Mode', [['observe','Observe'],['govern','Govern']]);
      const approve = button('Approve sample action', () => decide(true));
      const reject = button('Reject sample action', () => decide(false));
      const update = () => {
        approve.disabled = reject.disabled = mode.value !== 'govern';
        show(mode.value === 'observe'
          ? 'OBSERVE · Advisory: this proposed refund exceeds the user’s approval boundary. Observe records the concern without enforcing a pause. No real refund executes in this demo.'
          : 'GOVERN · PAUSE / request approval. The proposed refund requires explicit approval. Approve or reject this sample action below.');
        setRow(0,'ALLOW','read scope','ok'); setRow(1,'ALLOW','policy checked','ok');
        setRow(2,mode.value==='observe'?'WARN':'PAUSE','approval boundary','warn');
        setRow(3,'pending','after decision','muted');
        metrics.forEach((el,i)=>{el.textContent=['2','0',mode.value==='govern'?'1':'0'][i];});
      };
      function decide(allowed) {
        setRow(2,allowed?'ALLOW':'BLOCK',allowed?'sample approved':'sample rejected',allowed?'ok':'bad');
        metrics.forEach((el,i)=>{el.textContent=[allowed?'3':'2',allowed?'0':'1','0'][i];});
        show(allowed?'Sample approval recorded. The example refund is now permitted within this demo only. No payment is sent.':'Sample action rejected. The example refund remains blocked. No payment is sent.');
        approve.disabled = reject.disabled = true;
      }
      mode.addEventListener('change',update);
      approve.disabled = reject.disabled = true;
      button('Review proposed action', update);
    }
    if (key === 'evals') {
      const thresholdLabel = make('label', 'Minimum pass rate ', controls);
      const threshold = make('input', '', thresholdLabel, {type:'range',min:'0',max:'100',step:'5',value:'95','aria-label':'Minimum pass rate'});
      const value = make('span','95%',thresholdLabel);
      let ran = false;
      const gate = () => {
        value.textContent = threshold.value+'%';
        if (!ran) { show('Run the suite to apply this threshold to measured example results.'); return; }
        pause();
        const passed = 75 >= Number(threshold.value);
        metrics.forEach((el,i)=> {el.textContent=['3 / 4','75%',passed?'Passed':'Blocked'][i];});
        output.textContent = `Release gate ${passed?'passes':'blocks'}: 75% ${passed?'≥':'<'} required ${threshold.value}%. The latency case still fails; changing the gate threshold does not change case results.`;
      };
      button('Run test suite', () => {
        ran = true; setRow(0,'PASS','1.00','ok');setRow(1,'PASS','1.00','ok');setRow(2,'PASS','1.00','ok');setRow(3,'FAIL','2.4s > 2.0s','bad');gate();
      });
      threshold.addEventListener('input',gate);
      const details = make('details','',panel);
      make('summary','Inspect failed case: escalation',details);
      make('p','Check: latency ≤ 2,000 ms. Evidence: sample span escalation-04 took 2,400 ms (exceeds limit by 400 ms). Expected: complete escalation within 2 seconds. Actual: completed in 2.4 seconds.',details);
      details.addEventListener('toggle',()=>{if(details.open)pause();});
    }
    if (key === 'mcp') {
      const tool = select('Demo tool', [['core.health','core.health'],['lens.analyze_workflow','lens.analyze_workflow']]);
      make('p','Available here: core.health and lens.analyze_workflow (sample results only). Hosted HTTP excludes chaos.run_experiment; trusted local stdio supports a broader capability set.',panel,{class:'dal-demo-context'});
      button('Run sample call', () => {
        const name = tool.value;
        const result = name === 'core.health' ? {status:'healthy'} : {workflow_id:'demo-7f2',status:'succeeded',latency_ms:1880,tokens:{input:1600,output:560},findings:[{step:'llm.generate',message:'Overlapping retrieval context; review for redundancy.'}]};
        show(JSON.stringify({simulation:true,request:{method:'tools/call',params:{name,arguments:name==='core.health'?{}:{workflow:'sample-support-workflow'}}},illustrative_result:result},null,2));
      });
    }
  });

  document.querySelectorAll('[data-fleet]').forEach(card => {
    const rows = [...card.querySelectorAll('[data-fleet-rows] li')];
    const panel = make('div','',card,{class:'dal-demo dal-fleet-interactive'});
    make('small','EXPLORE THE EXAMPLE FLEET',panel);
    const controls = make('div','',panel,{class:'dal-demo-inputs'});
    const label = make('label','Health filter ',controls);
    const filter = make('select','',label,{'aria-label':'Fleet health filter'});
    [['all','All agents'],['ok','Healthy'],['warn','Degraded'],['bad','Unhealthy']].forEach(([value,text])=>make('option',text,filter,{value}));
    const note = make('p','Showing 4 sample agents from the 48-agent example fleet.',panel);
    const detail = make('div','Select an agent to inspect its deployment health.',panel,{class:'dal-demo-inspector',role:'status'});
    let selected = 0;
    const applyFilter = () => {
      rows.forEach(row=>{row.hidden=filter.value!=='all' && row.dataset.state!==filter.value;});
      note.textContent = `Showing ${rows.filter(row=>!row.hidden).length} of 4 sample agents from the 48-agent example fleet.`;
    };
    const inspect = i => {
      selected = i;
      const row = rows[i];
      detail.textContent = `${row.querySelector('span').textContent} · ${row.querySelector('small').textContent}\nDeployment health: ${row.querySelector('em').textContent}\nLast heartbeat: ${row.querySelector('time').textContent} ago.\nHealth tracks heartbeat freshness; it does not describe policy decisions or evaluation quality.`;
    };
    filter.addEventListener('change',()=>{card.dataset.manual='true';applyFilter();});
    rows.forEach((row,i)=>{
      const name=row.querySelector('span');const text=name.textContent;name.textContent='';
      const btn=make('button',text,name,{type:'button',class:'dal-fleet-agent'});
      btn.addEventListener('click',()=>{card.dataset.manual='true';inspect(i);});
    });
    const change = (state,age) => {
      card.dataset.manual='true';
      const row=rows[selected],prev=row.dataset.state;
      if(prev!==state){
        [prev,state].forEach((key,i)=>{
          const count=card.querySelector(`[data-count="${key}"]`);
          count.textContent=String(Number(count.textContent)+(i===0?-1:1));
          card.querySelector(`[data-bar="${key}"]`).style.flexGrow=count.textContent;
        });
      }
      row.dataset.state=state;row.querySelector('em').textContent=state==='bad'?'no heartbeat':'healthy';row.querySelector('time').textContent=age;
      const feed=card.querySelector('[data-fleet-feed]');
      const item=document.createElement('li');make('time','now',item);make('b',row.querySelector('span').textContent,item,{class:state});item.append(state==='bad'?' heartbeat became stale (simulated)':' heartbeat received (simulated)');feed.prepend(item);while(feed.children.length>3)feed.lastElementChild.remove();
      applyFilter();inspect(selected);
    };
    const stale=make('button','Make selected heartbeat stale',controls,{type:'button'});stale.addEventListener('click',()=>change('bad','4m'));
    const recover=make('button','Send sample heartbeat',controls,{type:'button'});recover.addEventListener('click',()=>change('ok','0s'));
    make('p','Interactions pause the automatic fleet demo. All changes are simulated.',panel,{class:'dal-demo-note'});
  });
})();
