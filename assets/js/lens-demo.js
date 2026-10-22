/* A self-contained concept dashboard. No requests, ingestion or production actions. */
(() => {
  const root = document.querySelector('[data-lens]');
  if (!root) return;
  const agents = ['orchestrator', 'triage', 'order-specialist', 'resolution'];
  const fmt = n => n.toLocaleString('en-US');
  const money = n => '$' + n.toFixed(5);
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const span = (id,parent,name,type,agent,start,duration,input=0,output=0,status='ok',attrs={}) => ({id,parent,name,type,agent,start,duration,input,output,status,attrs});
  function spans(slow) {
    // Parent spans carry no token usage; model leaves own usage exactly once.
    const end=slow?6840:3200;
    return [
      span('root',null,'Agent 1 · Support orchestrator','workflow','orchestrator',0,end),
      span('plan','root','orchestrator.plan','model','orchestrator',0,300,300,100,'ok',{model:'demo-reasoning',provider:'fictional-provider'}),
      span('mcp','root','MCP server','mcp','orchestrator',20,200,0,0,'ok',{transport:'streamable-http',server:'support-mcp (demo)'}),
      span('mcp-tool','mcp','customer.lookup','tool','orchestrator',40,160,0,0,'ok',{tool:'customer.lookup',protocol:'MCP',result:'customer found; PII redacted'}),
      span('external','root','CRM REST API','external','orchestrator',40,180,0,0,'ok',{method:'GET',route:'/tickets/NS-1042',status_code:200}),
      span('vector','root','Vector database · knowledge.search','vector','orchestrator',80,170,0,0,'ok',{collection:'support-knowledge',top_k:4,matches:4}),
      span('triage','root','Agent 2 · Triage researcher','agent','triage',300,500),
      span('classify','triage','classify intent','model','triage',320,250,400,100,'ok',{model:'demo-small',provider:'fictional-provider'}),
      span('web','triage','Web · search delivery notices','web','triage',590,120,0,0,'ok',{query:'carrier regional delivery notices',results:3}),
      span('history','triage','memory.read_history','memory','triage',580,150,0,0,'ok',{entries:12,bytes:4600}),
      span('order','root','Agent 3 · Order specialist','agent','order-specialist',800,end-800),
      span('lookup','order','orders.lookup','tool','order-specialist',820,220,0,0,'ok',{tool:'orders.lookup',order_id:'NS-1042'}),
      span('carrier','order','carrier.lookup','tool','order-specialist',1040,slow?4000:500,0,0,slow?'error':'ok',{tool:'carrier.lookup',...(slow?{error:'TimeoutError',timeout_ms:4000}:{cache_hit:true})}),
      ...(slow?[span('retry','order','carrier.lookup retry','retry','order-specialist',5040,300,0,0,'ok',{attempt:2,recovered:true})]:[]),
      span('order-model','order','summarize delivery status','model','order-specialist',slow?5340:1540,200,slow?900:600,200,'ok',{model:'demo-reasoning',provider:'fictional-provider'}),
      span('resolution','order','Agent 4 · Resolution assistant','agent','resolution',slow?5540:1840,slow?1300:1360),
      span('policy','resolution','policy.search','retrieval','resolution',slow?5560:1860,180,0,0,'ok',{retrieved_chunks:8,used_chunks:2}),
      span('response','resolution','compose response','model','resolution',slow?5740:2040,slow?1000:1100,slow?600:400,240,'ok',{model:'demo-reasoning',provider:'fictional-provider'}),
      span('write','resolution','memory.write_summary','memory','resolution',slow?6740:3140,slow?100:60,0,0,'ok',{entries:1,redaction:'email and address masked'})
    ];
  }
  const runs = [
    {id:'ns-1042',ago:2,version:'v1.0',status:'recovered',slow:true},
    {id:'ns-1043',ago:5,version:'v1.1',status:'ok',slow:false},
    {id:'ns-1044',ago:9,version:'v1.0',status:'recovered',slow:true},
    {id:'ns-1045',ago:18,version:'v1.1',status:'ok',slow:false},
    {id:'ns-1046',ago:32,version:'v1.0',status:'recovered',slow:true},
    {id:'ns-1047',ago:48,version:'v1.1',status:'ok',slow:false}
  ].map(r=>({...r,spans:spans(r.slow)}));
  const modelCost = s => s.type==='model' ? (s.input*(s.attrs.model==='demo-small'?0.2:2)+s.output*(s.attrs.model==='demo-small'?0.8:8))/1e6 : 0;
  const totals = list => list.reduce((a,s)=>({input:a.input+s.input,output:a.output+s.output,cost:a.cost+modelCost(s)}),{input:0,output:0,cost:0});
  let selected='ns-1042', selectedSpan='carrier', tab='traces', range=60, filter='all', search='';
  const current=()=>runs.find(r=>r.id===selected);
  const visible=()=>runs.filter(r=>r.ago<=range&&(filter==='all'||(filter==='errors'?r.spans.some(s=>s.status==='error'):r.status==='ok'))&&`${r.id} ${r.version} ${r.status} ${r.spans.map(s=>s.name).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  const badge=(s)=>`<span class="ld-badge ${s==='error'?'ld-error':s==='recovered'?'ld-recovered':''}">${s==='ok'?'success':s}</span>`;
  const section=(title,sub,body,extra='')=>`<section class="ld-panel ${extra}"><div class="ld-panel-head"><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  function metrics() {
    const list=visible(), values=list.map(r=>r.spans[0].duration).sort((a,b)=>a-b), t=totals(list.flatMap(r=>r.spans));
    const errors=list.filter(r=>r.spans.some(s=>s.status==='error')).length;
    const p95=values.length?values[Math.ceil(.95*values.length)-1]/1000:0;
    const cards=[['Traces',fmt(list.length),'matching the active filters'],['p95 latency',p95.toFixed(2)+' s','nearest-rank · root duration'],['With span errors',list.length?(errors/list.length*100).toFixed(1)+'%':'—',`${errors} traces · includes recovered`],['Total tokens',fmt(t.input+t.output),`${fmt(t.input)} in / ${fmt(t.output)} out`],['Estimated cost',money(t.cost),'fictional demo rates']];
    return `<div class="ld-metrics">${cards.map(([name,value,hint])=>`<div><span>${name}</span><b>${value}</b><small>${hint}</small></div>`).join('')}</div>`;
  }
  function miniChart() {
    const list=visible().slice().reverse();
    return section('Request latency','Each point is a matching run · click to open its trace',`<div class="ld-chart" aria-label="Run durations">${list.map(r=>`<button data-run="${r.id}" aria-label="Open trace ${r.id}" class="ld-chart-col${r.id===selected?' active':''}"><span>${(r.spans[0].duration/1000).toFixed(2)}s</span><i style="height:${r.spans[0].duration/6840*68}px" class="${r.slow?'slow':''}"></i><small>${r.ago}m ago</small></button>`).join('')||'<p>No matching traces.</p>'}</div>`);
  }
  function topology() {
    const r=current();
    return section('Agent topology','Delegation hierarchy · selects the corresponding span',`<div class="ld-topology"><button data-span="root"><i class="ld-node-dot"></i>Orchestrator</button><div class="ld-branches">${[['triage','Triage','memory · model'],['order','Order specialist','tools · delegated subagent'],['resolution','↳ Resolution','child of order specialist']].map(([id,title,detail])=>`<button data-span="${id}"><strong>${title}</strong><small>${detail}</small>${id==='order'&&r.slow?'<span class="ld-node-alert">1 recovered error</span>':''}</button>`).join('')}</div></div>`);
  }
  function traceList() {
    const list=visible();
    return section('Trace explorer',`${list.length} matching runs · select to inspect`, `<div class="ld-trace-list">${list.map(r=>`<button data-run="${r.id}" aria-pressed="${r.id===selected}"><span><strong>${r.id}</strong><small>support.resolve · ${r.version} · ${r.ago}m ago</small></span><span>${badge(r.status)}<small>${(r.spans[0].duration/1000).toFixed(2)}s · ${fmt(totals(r.spans).input+totals(r.spans).output)} tok</small></span></button>`).join('')||'<p class="ld-empty">No traces match. Try a longer window or clear your filters.</p>'}</div>`);
  }
  function callGraph() {
    const r = current();
    const typeLabel = {workflow:'ROOT AGENT',agent:'SUBAGENT',model:'LLM CALL',mcp:'MCP SERVER',external:'EXTERNAL API',vector:'VECTOR DATABASE',web:'WEB SEARCH',tool:'TOOL CALL',memory:'MEMORY',retrieval:'RETRIEVAL',retry:'RETRY'};
    const icon = {workflow:'◈',agent:'◈',model:'✦',mcp:'⇄',external:'↗',vector:'▱',web:'◎',tool:'⌁',memory:'▤',retrieval:'⌕',retry:'↻'};
    const subtree = id => r.spans.filter(s=>s.parent===id).flatMap(s=>[s,...subtree(s.id)]);
    const node = s => {
      const children = r.spans.filter(c=>c.parent===s.id);
      const t = totals([s,...subtree(s.id)]);
      return `<li class="ld-graph-branch"><button class="ld-graph-node ${s.type}${s.status==='error'?' error':''}${selectedSpan===s.id?' selected':''}" data-span="${s.id}" aria-pressed="${selectedSpan===s.id}"><span class="ld-graph-node-type"><i>${icon[s.type]||'·'}</i>${typeLabel[s.type]||s.type}${s.status==='error'?'<b>ERROR</b>':''}</span><strong>${s.name}</strong><span class="ld-graph-node-meta">${fmt(s.duration)} ms <span>· ${fmt(t.input+t.output)} tokens</span></span></button>${children.length?`<ul aria-label="Calls made by ${s.name}">${children.map(node).join('')}</ul>`:''}</li>`;
    };
    return section('Distributed call graph',`${r.id} · arrows show who called whom · select any node to inspect its span`, `<div class="ld-graph-intro"><span><i class="ld-type agent"></i> Agent → dependency or delegated subagent</span><span>Parent tokens include descendants</span></div><div class="ld-graph-scroll" tabindex="0" role="region" aria-label="Scrollable agent call graph"><ul class="ld-call-graph" aria-label="Trace call hierarchy">${node(r.spans[0])}</ul></div><p class="ld-footnote">Agent 1 calls MCP, an external API, a vector database and subagents. Agent 2 uses web search and memory. Agent 3 delegates to Agent 4, which retrieves policy, calls a model and writes memory. Connections show call ownership, not chronological order.</p>`);
  }
  function inspector() {
    const r=current(), s=r.spans.find(s=>s.id===selectedSpan)||r.spans[0];
    const collect=id=>r.spans.filter(x=>x.parent===id).flatMap(x=>[x,...collect(x.id)]);
    const t=totals([s,...collect(s.id)]);
    return section('Span inspector','Select an agent, tool or dependency node to inspect its captured span',`<div class="ld-inspector" aria-live="polite"><div class="ld-inspector-title"><h4>${s.name}</h4>${badge(s.status)}</div><dl>${[['Span ID',s.id],['Parent',s.parent||'— root'],['Type',s.type],['Agent',s.agent],['Start offset',fmt(s.start)+' ms'],['Duration',fmt(s.duration)+' ms'],['Own tokens',fmt(s.input+s.output)],['Subtree tokens',fmt(t.input+t.output)],['Subtree est. cost',money(t.cost)]].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><h4>Captured attributes</h4><pre>${escape(JSON.stringify({...s.attrs,'capture.content':'redacted'},null,2))}</pre>${s.status==='error'?'<p class="ld-insight">carrier.lookup exceeded 4,000 ms. The later retry recovered; this error does not mean the whole run failed.</p>':''}<p class="ld-footnote">Parent token totals roll up descendants. Overall totals count model leaves once.</p></div>`);
  }
  function tokenView() {
    const r=current(), t=totals(r.spans), total=t.input+t.output;
    const rows=agents.map(a=>({name:a,...totals(r.spans.filter(s=>s.agent===a))}));
    return section('Token attribution',`${r.id} · exclusive ownership by model-call agent · no double counting`, `<div class="ld-token-total"><b>${fmt(total)}</b><span>total tokens</span><small>${fmt(t.input)} input + ${fmt(t.output)} output · ${money(t.cost)} estimated</small></div><div class="ld-token-chart">${rows.map(a=>`<div><span>${a.name}</span><div class="ld-token-track"><i style="width:${a.input/total*100}%"></i><b style="width:${a.output/total*100}%"></b></div><strong>${fmt(a.input+a.output)}</strong></div>`).join('')}</div><div class="ld-legend"><span><i class="ld-type model"></i>Input tokens</span><span><i class="ld-type tool"></i>Output tokens</span></div><div class="ld-table-scroll"><table class="ld-table"><caption>Per-agent token and cost breakdown</caption><thead><tr><th>Agent</th><th>Input</th><th>Output</th><th>Total</th><th>Share</th><th>Est. cost</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${a.name}</td><td>${fmt(a.input)}</td><td>${fmt(a.output)}</td><td>${fmt(a.input+a.output)}</td><td>${((a.input+a.output)/total*100).toFixed(1)}%</td><td>${money(a.cost)}</td></tr>`).join('')}<tr><th>Total</th><td>${fmt(t.input)}</td><td>${fmt(t.output)}</td><td>${fmt(total)}</td><td>100%</td><td>${money(t.cost)}</td></tr></tbody></table></div><p class="ld-footnote">Tool calls consume no LLM tokens in this sample. Tool output included in a prompt is charged to that model call. Demo pricing: reasoning $2/M input + $8/M output; small $0.20/M + $0.80/M. These are fictional rates.</p>`)+section('Model call inventory','Inspect the underlying span for model, provider and usage',`<div class="ld-table-scroll"><table class="ld-table"><thead><tr><th>Model operation</th><th>Agent</th><th>Model</th><th>Tokens</th><th></th></tr></thead><tbody>${r.spans.filter(s=>s.type==='model').map(s=>`<tr><td>${s.name}</td><td>${s.agent}</td><td>${s.attrs.model}</td><td>${fmt(s.input+s.output)}</td><td><button data-evidence="${s.id}">Inspect ↗</button></td></tr>`).join('')}</tbody></table></div>`);
  }
  function diagnostics() {
    const r=current();
    const findings=[
      ...(r.slow?[{title:'Carrier timeout dominates this run',severity:'High latency',evidence:'carrier',text:'4,000 ms / 6,840 ms = 58.5% of root duration in carrier.lookup. TimeoutError was recovered by a later retry.',rule:'dependency_timeout · confidence: high',action:'Inspect the provider timeout budget and caching options. Validate recovery on a broader sample.'},{title:'Retry overhead is measurable',severity:'Recovered',evidence:'retry',text:'Attempt 2 adds 300 ms (4.4% of root duration). The run succeeds after retry; the original error remains visible.',rule:'retry_overhead · confidence: high',action:'Compare bounded retry policies against repeated baseline runs.'}]:[{title:'Carrier lookup uses cached evidence',severity:'Healthy',evidence:'carrier',text:'The fictional candidate records cache_hit=true. Carrier lookup takes 500 ms, with no retries in this run.',rule:'dependency_observation · confidence: high',action:'Check cache freshness and validate behavior on cache misses.'}]),
      {title:'Retrieval has low observed utilization',severity:'Token opportunity',evidence:'policy',text:'8 chunks retrieved; 2 marked used (25%). This suggests excess context, not proof that the other chunks are unnecessary.',rule:'retrieval_utilization · confidence: medium',action:'Test a lower top-k and compare answer quality before reducing context.'},
      {title:'Conversation memory is visible',severity:'Memory',evidence:'history',text:'12 history entries / 4,600 bytes read in 150 ms. Sensitive content is masked in this demonstration.',rule:'memory_observation · confidence: high',action:'Use observed history growth to decide whether summarization needs evaluation.'}
    ];
    return section('Evidence-backed diagnostics',`${r.id} · findings identify the supporting span, measurement and confidence`, `<div class="ld-findings">${findings.map(f=>`<article><span class="ld-badge">${f.severity}</span><h4>${f.title}</h4><p>${f.text}</p><small>${f.rule}</small><div class="ld-insight">${f.action}</div><button data-evidence="${f.evidence}">Open evidence: ${f.evidence} ↗</button></article>`).join('')}</div>`)+section('Capture & interoperability','Conceptual capability summary grounded in the AgenticLens source',`<div class="ld-capabilities"><div><h4>Privacy-aware capture</h4><p>Inspect redacted attributes. Raw prompts and personal details are not included in this demo.</p></div><div><h4>Portable telemetry</h4><p>AgenticLens supports OTLP/HTTP JSON import and export. This demo downloads simplified JSON, not a validated OTLP payload.</p></div><div><h4>Evaluation evidence</h4><p>Trace-aware evaluation composes with Agentic-Evals. Explore recorded-output scoring in <a href="/usecases/3/">use case 03 →</a>.</p></div></div>`);
  }
  function compare() {
    const baseline=runs.filter(r=>r.slow),candidate=runs.filter(r=>!r.slow);
    const sample=rs=>({n:rs.length,latency:rs.reduce((a,r)=>a+r.spans[0].duration,0)/rs.length,tokens:rs.reduce((a,r)=>{const t=totals(r.spans);return a+t.input+t.output;},0)/rs.length,cost:rs.reduce((a,r)=>a+totals(r.spans).cost,0)/rs.length});
    const a=sample(baseline),b=sample(candidate);
    return section('Baseline vs candidate','Fixed comparison cohort · all 6 bundled runs, independent of explorer filters',`<div class="ld-comparison"><div><span>BASELINE / v1.0</span><b>6.84 s</b><small>3 runs · carrier timeout + retry</small></div><span>→</span><div><span>CANDIDATE / v1.1</span><b>3.20 s</b><small>3 runs · cached carrier lookup</small></div></div><div class="ld-table-scroll"><table class="ld-table"><caption>Repeated-run comparison · fictional sample</caption><thead><tr><th>Metric</th><th>v1.0 mean</th><th>v1.1 mean</th><th>Change</th></tr></thead><tbody>${[['Latency',a.latency,b.latency,n=>(n/1000).toFixed(2)+' s'],['Tokens',a.tokens,b.tokens,n=>fmt(n)],['Estimated cost',a.cost,b.cost,money]].map(([name,x,y,format])=>`<tr><td>${name}</td><td>${format(x)}</td><td>${format(y)}</td><td class="ld-positive">${((y-x)/x*100).toFixed(1)}%</td></tr>`).join('')}<tr><td>Traces with span errors</td><td>3 / 3</td><td>0 / 3</td><td>−3 traces</td></tr></tbody></table></div><p class="ld-insight">Candidate uses fewer input tokens and cached tool evidence. Validate answer quality and cache freshness before adopting the change.</p><p class="ld-footnote">Three identical scripted runs per variant illustrate the UI only. No confidence interval, significance or production savings claim can be inferred. No actual experiment was executed.</p><button data-run="ns-1043" data-show-trace>Inspect a candidate trace ↗</button>`);
  }
  function content() {
    if(!current()) return '<div class="ld-empty">No trace selected.</div>';
    return tab==='traces'?`<div class="ld-trace-layout ld-graph-layout"><div>${callGraph()}</div><aside>${inspector()}</aside></div>`:tab==='tokens'?tokenView():tab==='diagnostics'?diagnostics():compare();
  }
  function render() {
    const list=visible();if(!list.some(r=>r.id===selected)){selected=list[0]?.id;selectedSpan='root';}
    root.innerHTML=`<header class="ld-header"><div class="ld-brand"><span>◉</span><strong>AgenticLens</strong><small>OBSERVABILITY</small></div><span class="ld-sandbox"><i></i> DEMO SANDBOX</span><button data-reset>↻ Reset</button></header><div class="ld-toolbar"><div><p class="uc-kicker">APPLICATION / NORTHSTAR SUPPORT</p><h2>Agent operations</h2></div><div class="ld-filter-controls"><label>Time window<select data-filter="range"><option value="15"${range===15?' selected':''}>Last 15 minutes</option><option value="60"${range===60?' selected':''}>Last 60 minutes</option></select></label><button data-export${!current()?' disabled':''}>Export selected trace ↓</button></div></div><div class="ld-filterbar"><label>Search traces<input type="search" data-search placeholder="Trace ID, version or operation" value="${escape(search)}"></label><label>Trace status<select data-filter="status"><option value="all"${filter==='all'?' selected':''}>All traces</option><option value="errors"${filter==='errors'?' selected':''}>Contains span errors</option><option value="success"${filter==='success'?' selected':''}>Success without errors</option></select></label><span>Snapshot: relative times are fixed<br>All charts use fictional telemetry</span></div>${metrics()}<div class="ld-overview">${miniChart()}${current()?topology():section('Agent topology','Select a trace to view its agents','<p class="ld-empty">No matching trace.</p>')}</div><div class="ld-explorer"><aside>${traceList()}</aside><div class="ld-detail"><div class="ld-tabs" role="tablist" aria-label="Trace views">${[['traces','Distributed trace'],['tokens','Tokens & cost'],['diagnostics','Diagnostics'],['compare','Compare runs']].map(([key,label])=>`<button role="tab" id="ld-tab-${key}" aria-controls="ld-view" aria-selected="${tab===key}" tabindex="${tab===key?0:-1}" data-tab="${key}">${label}</button>`).join('')}</div><div id="ld-view" role="tabpanel" aria-labelledby="ld-tab-${tab}" tabindex="0">${content()}</div></div></div><footer class="ld-footer"><span>Sample telemetry · No live backend · Simplified artifacts</span><span>Token totals count model leaves once · Costs use fictional rates</span></footer>`;
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-reset')){selected='ns-1042';selectedSpan='carrier';range=60;filter='all';search='';tab='traces';}
    else if(b.dataset.run){selected=b.dataset.run;selectedSpan='root';if(b.hasAttribute('data-show-trace')){filter='all';range=60;search='';tab='traces';}}
    else if(b.dataset.span){selectedSpan=b.dataset.span;tab='traces';}
    else if(b.dataset.evidence){selectedSpan=b.dataset.evidence;tab='traces';}
    else if(b.dataset.tab){tab=b.dataset.tab;}
    else if(b.hasAttribute('data-export')){
      const blob=new Blob([JSON.stringify({simulation:true,format:'simplified-demo-trace-not-otlp',rates:'fictional',...current(),totals:totals(current().spans)},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`agenticlens-${selected}-demo.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
    }else return;
    const focusSelector = b.dataset.tab ? `[data-tab="${tab}"]`
      : b.dataset.span ? `.ld-graph-node[data-span="${selectedSpan}"]`
      : b.dataset.run ? `.ld-trace-list [data-run="${selected}"]`
      : b.dataset.evidence ? '.ld-inspector h4'
      : '[data-reset]';
    render();
    const focusTarget = root.querySelector(focusSelector);
    if (focusTarget) {
      if (focusTarget.tagName === 'H4') focusTarget.tabIndex = -1;
      focusTarget.focus({preventScroll:true});
    }
  });
  root.addEventListener('change',e=>{if(e.target.dataset.filter==='range')range=Number(e.target.value);else if(e.target.dataset.filter==='status')filter=e.target.value;else return;render();});
  root.addEventListener('input',e=>{if(!e.target.hasAttribute('data-search'))return;search=e.target.value;const position=e.target.selectionStart;render();const input=root.querySelector('[data-search]');input.focus({preventScroll:true});try{input.setSelectionRange(position,position);}catch{} });
  root.addEventListener('keydown',e=>{
    if(!e.target.matches('[role="tab"]'))return;
    const keys=['traces','tokens','diagnostics','compare'];let index=keys.indexOf(tab);
    if(e.key==='ArrowRight')index=(index+1)%4;else if(e.key==='ArrowLeft')index=(index+3)%4;else if(e.key==='Home')index=0;else if(e.key==='End')index=3;else return;
    e.preventDefault();tab=keys[index];render();root.querySelector(`[data-tab="${tab}"]`).focus({preventScroll:true});
  });
  render();
})();
