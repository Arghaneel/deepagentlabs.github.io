/* Concept demonstrations only. All artifacts and results are fictional and browser-local. */
(() => {
  const app = document.querySelector('[data-demo]');
  if (!app) return;
  const id = Number(app.dataset.demo);
  const labels = {
    1: ['Inspect fleet', 'Investigate failure', 'Test resilience', 'Check supervision', 'Operations report'],
    2: ['Capture production', 'Record & standardize', 'Replay with a fault', 'Optimize & validate', 'Release evidence'],
    3: ['Capture & export', 'Import recording', 'Evaluate recording', 'Replay candidate', 'Compare & decide']
  }[id];
  let step = 0;
  let state;
  const resetState = () => { state = { fault: 'timeout', optimized: false, replayed: false, evaluated: false, imported: false, candidate: 'balanced', candidateRun: false, asked: {} }; };
  resetState();
  const artifact = {
    simulation: true,
    artifact_type: 'illustrative_ai_ops_recording',
    note: 'Simplified concept artifact; not a validated AI Operations Specification payload.',
    run_id: 'ns-1042', environment: 'production (fictional)', version: 'v1.0',
    request: 'Order NS-1042 is late. Can you check the delivery and help me?',
    agents: ['triage', 'order-specialist', 'resolution'],
    steps: [
      { agent: 'triage', action: 'classify_request', duration_ms: 340, status: 'ok' },
      { agent: 'order-specialist', tool: 'carrier.lookup', duration_ms: 4800, status: 'timeout' },
      { agent: 'resolution', action: 'request_human_followup', duration_ms: 1700, status: 'ok' }
    ],
    metrics: { latency_ms: 6840, tokens: 2840, quality: 78, safety: 100 }
  };
  const stage = app.querySelector('[data-stage]');
  const chips = names => `<div class="uc-chips">${names.map(n => `<span class="uc-chip">${n}</span>`).join('')}</div>`;
  const metrics = items => `<div class="uc-metrics">${items.map(([n,v]) => `<div class="uc-metric"><b>${v}</b><span>${n}</span></div>`).join('')}</div>`;
  const status = (s,w=false) => `<div class="uc-status${w?' warn':''}" role="status">${s}</div>`;
  const trace = () => `<div class="uc-trace"><div>01 / Triage agent<small>classify_request · 340 ms<br>Intent → delivery support</small></div><div>02 / Order specialist<small>carrier.lookup · 4,800 ms<br>Timeout → no retry budget</small></div><div>03 / Resolution agent<small>human follow-up · 1,700 ms<br>Safe escalation, incomplete task</small></div></div>`;
  const head = (title,lead,packages) => `<p class="uc-kicker">${String(step+1).padStart(2,'0')} / ${labels[step].toUpperCase()}</p><h2>${title}</h2><p class="uc-lead">${lead}</p>${chips(packages)}`;
  const panel = (title,body) => `<div class="uc-panel"><h3>${title}</h3>${body}</div>`;
  const button = (action,text) => `<button class="uc-primary" type="button" data-action="${action}">${text}</button>`;
  const jsonPanel = () => `<details class="uc-panel"><summary>Inspect illustrative recording JSON</summary><pre data-json></pre><button type="button" data-action="download">Download sample JSON ↓</button></details>`;
  const faultSelect = () => `<div class="uc-controls"><label>Injected fault <select data-setting="fault"><option value="timeout"${state.fault==='timeout'?' selected':''}>Carrier API timeout</option><option value="provider"${state.fault==='provider'?' selected':''}>LLM provider unavailable</option><option value="context"${state.fault==='context'?' selected':''}>Corrupted order context</option></select></label></div>`;
  function replayResult(optimized) {
    const scenarios = {
      timeout: { failure: 'Carrier API exceeds the timeout budget. The original workflow escalates without recovering.', fix: 'A bounded retry and a cached carrier status resolve the request.', latency: '3.2 s', quality: '94 / 100' },
      provider: { failure: 'The primary LLM provider is unavailable. The original workflow cannot complete its handoff.', fix: 'The fallback model takes over within the retry budget and completes the handoff.', latency: '3.8 s', quality: '91 / 100' },
      context: { failure: 'An invalid order identifier reaches the resolution agent. Supervision blocks the proposed refund.', fix: 'Context validation catches the invalid identifier. The agent asks for confirmation; the task remains incomplete.', latency: '2.7 s', quality: '82 / 100' }
    };
    const s=scenarios[state.fault];
    return status(optimized?s.fix:s.failure,!optimized||state.fault==='context')+metrics([['Task outcome',optimized?(state.fault==='context'?'Escalated':'Recovered'):'Incomplete'],['Replay latency',optimized?s.latency:'6.84 s'],['Quality',optimized?s.quality:'78 / 100']])+panel('Experiment evidence',`<p>${optimized?'Candidate v1.1':'Baseline v1.0'} · Fault: ${state.fault}. ${optimized?'Safety: 100 / 100. No unsafe refund was executed.':'Evidence: dependency failure → missing recovery path → task incomplete.'}</p><p class="uc-muted">One fictional scenario, not an aggregate benchmark or production measurement.</p>`);
  }
  function mcp() {
    const prompts = ['How are my AI agents performing today?', 'Why did order NS-1042 fail? Was the response accurate?', 'What happens if our LLM provider becomes unavailable?', 'Did the agents recover safely?', 'Give me an overall AgenticOps report.'];
    const tools = ['AgenticLens → inspect traces and fleet metrics', 'AgenticLens + Agentic-Evals → inspect the failed execution', 'Agentic-Chaos → simulate a provider outage in a sandbox', 'Agentic-Sidecar + AgenticLens → inspect recovery decisions', 'Control Tower → consolidate illustrative evidence'];
    const replies = [
      'The fictional fleet handled 1,248 requests today. Completion is 96.2%, with 18 dependency timeouts. The order-specialist agent has elevated latency. Start with run ns-1042.',
      'The carrier lookup timed out after 4.8 seconds. The resolution agent safely offered human follow-up, but did not resolve the delivery request. Recorded-run quality: 78/100. Task completion: 60/100.',
      'The original workflow stops when the primary provider is unavailable. With fallback routing enabled, the sandbox replay completes in 3.8 seconds. This experiment affects no production systems.',
      'The candidate fallback recovered. Sidecar allowed a read-only order lookup and blocked a refund without verified order context. Recovery preserved the safety boundary.',
      'Attention required: dependency timeouts affect the order specialist. The simulated fallback improves resilience; the recorded run still shows an incomplete task. Recommendation: validate a wider scenario suite before any real release.'
    ];
    const packs=[['MCP','AgenticLens'],['MCP','AgenticLens','Agentic-Evals'],['MCP','Agentic-Chaos'],['MCP','Agentic-Sidecar','AgenticLens'],['MCP','Control Tower','AI Ops Spec']][step];
    return head(['Your operations, in one conversation.','Follow the evidence to the failure.','An outage you can learn from.','Recovery needs boundaries.','One view of the operational story.'][step], 'Choose the suggested developer prompt to reveal a scripted assistant response and its illustrative package activity.',packs)+`<div class="uc-chat"><span class="uc-chat-label">DEVELOPER → MCP ASSISTANT</span><p class="uc-prompt">${prompts[step]}</p>${state.asked[step]?`<div class="uc-tool">SIMULATED ACTIVITY / ${tools[step]}</div><p>${replies[step]}</p>`:button('ask','Send suggested prompt →')}</div>`+(state.asked[step] ? (step===0?metrics([['Fictional requests','1,248'],['Completion','96.2%'],['Dependency timeouts','18']]):step===1?`<div class="uc-panel">${trace()}</div>`:step===3?panel('Supervision decisions','<p>ALLOW · Read carrier status for NS-1042.</p><p>BLOCK · Issue refund with unverified context.</p>'):step===4?status('Demo recommendation: further validation required. No real deployment or configuration was changed.'):status('Sandbox experiment complete. Primary provider unavailable → fallback model → safe response.')):'');
  }
  function replay() {
    switch(step) {
      case 0:return head('A real-world shape. A fictional run.','AgenticLens captures the request, model and tool calls, agent handoffs, latency and outcome. This example ends with safe escalation after a carrier timeout.',['AgenticLens','Agentic-Sidecar'])+trace()+metrics([['Run duration','6.84 s'],['Total tokens','2,840'],['Task outcome','Incomplete']]);
      case 1:return head('Make the execution reusable.','Represent the captured execution in a common format and retain it as a scenario. The artifact below is a simplified illustration, not a schema-validated export.',['AI Ops Spec','AgenticLens'])+jsonPanel()+panel('From production to a sandbox','<p>Capture → standardize → record → import. The recording supplies the request and observed evidence; replay executes the scenario against an application version.</p>');
      case 2:return head('Replay under controlled failure.','Choose a disruption and run a scripted baseline experiment. Changing the fault clears the previous experiment.',['Agentic-Chaos','AgenticLens'])+faultSelect()+button('replay','Run baseline replay')+(state.replayed?replayResult(false):status('Ready in the development sandbox. Choose a fault to explore.'));
      case 3:return head('Change the strategy. Test it again.','The fictional candidate adds bounded retries, model fallback and context validation. Validate it under the same selected fault.',['Agentic-Chaos','Agentic-Evals','Agentic-Sidecar'])+faultSelect()+panel('Candidate v1.1 changes','<p>Carrier timeout → bounded retry + cached status.<br>Provider outage → fallback model.<br>Corrupted context → validate identifiers and request confirmation.</p>')+button('optimize','Validate optimized replay')+(state.optimized?replayResult(true):status('Validation has not run for this fault.'));
      case 4:return head('Close the loop with evidence.','Review what the experiment supports before a hypothetical redeployment. This demo never changes a production application.',['AgenticLens','Agentic-Evals','Control Tower'])+(state.optimized?replayResult(true)+status(state.fault==='context'?'Hold for review: safe escalation preserves safety, but task completion still needs work.':'Candidate passes this sample scenario. A broader test suite and review are still needed.'):status('No candidate validation yet. Return to “Optimize & validate” to generate evidence.',true))+panel('Continuous AgenticOps loop','<p>Production → capture → standardize → record → replay → chaos test → evaluate → optimize → validate → hypothetical redeployment.</p>');
    }
  }
  function evals() {
    const candidateSelect = `<div class="uc-controls"><label>Candidate configuration <select data-setting="candidate"><option value="balanced"${state.candidate==='balanced'?' selected':''}>v1.1 · reliable fallback</option><option value="fast"${state.candidate==='fast'?' selected':''}>v1.2 · speed-first prompt</option></select></label></div>`;
    switch(step) {
      case 0:return head('Start with what happened.','The triage, order specialist and resolution agents handle a delayed order. Lens records the timeout, handoffs and safe escalation; Sidecar supervises the attempted actions.',['AgenticLens','Agentic-Sidecar'])+trace()+jsonPanel();
      case 1:return head('Bring the recording into development.','Import the bundled fictional recording. Importing stores evidence for inspection; it does not rerun the application.',['AI Ops Spec'])+button('import','Import bundled sample')+(state.imported?status('Imported ns-1042 · v1.0 · 3 agents · 6 tool calls. Ready to evaluate the recorded behavior.')+jsonPanel():panel('A reusable scenario','<p>Original user request + tool evidence + observed responses + metadata. No personal or production data is used.</p>'));
      case 2:return head('Evaluate the recorded behavior.','Score the existing evidence without calling an agent or rerunning the workflow. These scores describe the original v1.0 execution only.',['Agentic-Evals'])+(state.imported?button('evaluate','Evaluate recording'):status('Import the bundled sample in the previous step before evaluating.',true))+(state.evaluated?table(false)+status('Baseline issue: safe but incomplete. The response offers follow-up without resolving the delivery request.',true):'');
      case 3:return head('Replay against a different version.','Unlike evaluating a recording, replay runs the scenario against a candidate configuration and creates a new execution to score. Both execution and scoring are simulated here.',['Agentic-Evals','AgenticLens'])+candidateSelect+(state.evaluated?button('candidate','Replay & evaluate candidate'):status('Evaluate the baseline recording first so the comparison has a reference.',true))+(state.candidateRun?status(state.candidate==='fast'?'Candidate v1.2: faster response, but an unverified refund was proposed. Safety regressed.':'Candidate v1.1: fallback resolves the request and preserves the safety boundary.',state.candidate==='fast')+metrics([['New execution',state.candidate==='fast'?'ns-1042-v1.2':'ns-1042-v1.1'],['Replay latency',state.candidate==='fast'?'1.9 s':'3.2 s'],['Tokens',state.candidate==='fast'?'1,760':'2,260']]):'');
      case 4:return head('Better scores. Visible tradeoffs.','The sample gate requires quality ≥ 90, task completion ≥ 90, safety = 100 and latency ≤ 4 seconds. Any failed requirement blocks the candidate.',['Agentic-Evals','Control Tower'])+(state.candidateRun?table(true)+status(state.candidate==='fast'?'BLOCKED · Safety 70/100. Speed and quality improvements cannot offset a safety regression.':'SAMPLE GATE PASSED · All four criteria pass for this fictional scenario. This is not production readiness evidence.',state.candidate==='fast'):status('No candidate execution yet. Replay a candidate to see comparison scores and a release assessment.',true))+panel('Keep the two operations distinct','<p>Evaluate recording: score what v1.0 already did.<br>Replay candidate: create and score a new execution of the same scenario on a different application version.</p>');
    }
  }
  function table(compare) {
    const fast=state.candidate==='fast';
    const rows=[['Response quality',78,fast?96:94],['Task completion',60,fast?95:96],['Tool use',75,fast?82:95],['Agent coordination',80,fast?88:94],['Safety',100,fast?70:100]];
    return `<div class="uc-table-wrap"><table class="uc-table"><caption>Illustrative evaluation scores / 100</caption><thead><tr><th>Dimension</th><th>Recorded v1.0</th>${compare?`<th>Candidate ${fast?'v1.2':'v1.1'}</th><th>Change</th>`:''}</tr></thead><tbody>${rows.map(([name,a,b])=>`<tr><td>${name}</td><td>${a}</td>${compare?`<td>${b}</td><td class="${b<a?'uc-down':'uc-up'}">${b>a?'+':''}${b-a}</td>`:''}</tr>`).join('')}<tr><td>Latency</td><td>6.84 s</td>${compare?`<td>${fast?'1.9':'3.2'} s</td><td class="uc-up">${fast?'−4.94':'−3.64'} s</td>`:''}</tr><tr><td>Tokens</td><td>2,840</td>${compare?`<td>${fast?'1,760':'2,260'}</td><td class="uc-up">${fast?'−1,080':'−580'}</td>`:''}</tr></tbody></table></div>`;
  }
  function render(focus=false) {
    app.querySelector('[data-steps]').innerHTML=labels.map((s,i)=>`<button type="button" class="uc-step" data-step="${i}"${i===step?' aria-current="step"':''}><span class="uc-step-num">${String(i+1).padStart(2,'0')}</span>${s}</button>`).join('');
    stage.innerHTML=id===1?mcp():id===2?replay():evals();
    stage.querySelectorAll('[data-json]').forEach(el=>{el.textContent=JSON.stringify(artifact,null,2);});
    app.querySelector('[data-progress]').textContent=`Step ${step+1} of ${labels.length} · All results simulated`;
    app.querySelector('[data-prev]').disabled=step===0;
    app.querySelector('[data-next]').disabled=step===labels.length-1;
    if(focus){const heading=stage.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }
  app.addEventListener('click',e=>{
    const target=e.target.closest('button');if(!target)return;
    if(target.hasAttribute('data-reset')){step=0;resetState();render(true);return;}
    if(target.hasAttribute('data-step')){step=Number(target.dataset.step);render(true);return;}
    if(target.hasAttribute('data-next')){step=Math.min(labels.length-1,step+1);render(true);return;}
    if(target.hasAttribute('data-prev')){step=Math.max(0,step-1);render(true);return;}
    switch(target.dataset.action){
      case 'ask':state.asked[step]=true;break;
      case 'import':state.imported=true;break;
      case 'evaluate':if(state.imported)state.evaluated=true;break;
      case 'replay':state.replayed=true;break;
      case 'optimize':state.optimized=true;break;
      case 'candidate':if(state.evaluated)state.candidateRun=true;break;
      case 'download':{
        const url=URL.createObjectURL(new Blob([JSON.stringify(artifact,null,2)],{type:'application/json'}));
        const a=document.createElement('a');a.href=url;a.download='northstar-illustrative-recording.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
      }
      default:return;
    }
    render(true);
  });
  app.addEventListener('change',e=>{
    if(e.target.dataset.setting==='fault'){state.fault=e.target.value;state.replayed=false;state.optimized=false;}
    else if(e.target.dataset.setting==='candidate'){state.candidate=e.target.value;state.candidateRun=false;}
    else return;
    render();
  });
  render();
})();
