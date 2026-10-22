/* Passive illustrative animation. No actions, requests or human decisions are performed. */
(() => {
 const root=document.querySelector('[data-sidecar-loop]');if(!root)return;
 const calls=[
  {key:'external',critical:false,name:'CRM customer lookup',proposal:'Propose a scoped customer lookup.',policy:'Read only the NS-1042 customer record. Redact personal fields.',context:'Resolve NS-1042; access only the relevant customer record.',critique:'The lookup supports the request. No bulk export or unrelated customer data.',review:'Scripted reviewer approves this scoped, redacted lookup.',result:'Customer record retrieved',evidence:'200 OK · 180 ms · personal fields redacted'},
  {key:'mcp',critical:false,name:'MCP support search',proposal:'Propose a search through the support MCP server.',policy:'Use only the approved support search tool; no unrestricted server actions.',context:'Keep the order ID and customer request attached to the MCP call.',critique:'Search only the matching case. Do not invoke unrelated MCP tools.',review:'Scripted reviewer approves this constrained MCP tool call.',result:'Relevant case found',evidence:'mcp.support.search · 240 ms · 1 matching case'},
  {key:'vector',critical:false,name:'Vector knowledge query',proposal:'Propose a relevant policy lookup in the vector database.',policy:'Restrict retrieval to the approved support-policy collection.',context:'Use the delayed-order intent to retrieve the applicable policy.',critique:'Four relevant policy chunks are sufficient for this sample decision.',review:'Scripted reviewer approves the scoped retrieval query.',result:'Policy context retrieved',evidence:'knowledge.query · 120 ms · top-k 4 · support policies only'},
  {key:'tool',critical:true,name:'Issue an eligible customer refund',proposal:'Propose a $25 refund for the affected order.',policy:'Financial changes are critical: require human approval for this exact order and amount.',context:'Resolve NS-1042 only; preserve data and follow the retrieved refund policy.',critique:'The sample policy permits a $25 refund. Confirm the recipient, amount and duplicate-refund check before requesting approval.',review:'Scripted reviewer approves a single $25 refund for order NS-1042.',result:'Approved refund issued',evidence:'payments.issue_refund · $25 · 310 ms · demo receipt RF-204'}
 ];
 const names=['Propose','Guardrails','Context','Critique','Approval','Execute','Result','Re-inject'];
 const checkKeys=['guardrails','context','critique','approval'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let phase=0,call=0,visible=false,timer;
 const set=(selector,text)=>{root.querySelector(selector).textContent=text;};
 const map=root.querySelector('.ss-diagram');
 const svgNS='http://www.w3.org/2000/svg';
 const wires=document.createElementNS(svgNS,'svg');
 wires.classList.add('ss-wires');wires.setAttribute('aria-hidden','true');map.prepend(wires);
 const connections=[];
 function connect(source,target,key){
  const group=document.createElementNS(svgNS,'g');group.dataset.wire=key;
  for(const cls of ['ss-wire-track','ss-wire-pulse']){const path=document.createElementNS(svgNS,'path');path.classList.add(cls);group.append(path);}
  wires.append(group);connections.push({source,target,group,key});
  const status=document.createElement('span');status.className='ss-node-status';status.textContent='·';status.setAttribute('aria-label','Pending');
  (target.querySelector('div')&&target.matches('.ss-check')?target.querySelector('div'):target).append(status);
 }
 checkKeys.forEach(key=>connect(root.querySelector('.ss-agent-symbol'),root.querySelector(`[data-ss-check="${key}"]`),key));
 root.querySelectorAll('[data-ss-target]').forEach(target=>connect(root.querySelector('[data-ss-gate]'),target,target.dataset.ssTarget));
 function drawWires(){
  const bounds=map.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
  wires.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  connections.forEach(({source,target,group,key})=>{
   const from=source.getBoundingClientRect(),to=target.getBoundingClientRect();
   const internal=checkKeys.includes(key),vertical=internal||matchMedia('(max-width:680px)').matches;
   const x1=(vertical?from.left+from.width/2:from.right)-bounds.left;
   const y1=(vertical?from.bottom:from.top+from.height/2)-bounds.top;
   const x2=(vertical?to.left+to.width/2:to.left)-bounds.left;
   const y2=(vertical?to.top:to.top+to.height/2)-bounds.top;
   const d=vertical?`M ${x1} ${y1} C ${x1} ${y1+22}, ${x2} ${y2-22}, ${x2} ${y2}`:`M ${x1} ${y1} C ${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}`;
   [...group.children].forEach(path=>path.setAttribute('d',d));
   group.style.setProperty('--wire-length',group.firstChild.getTotalLength());
  });
 }
 function wireState(key,state){
  const {group,target}=connections.find(c=>c.key===key);
  group.setAttribute('class','ss-wire-group '+state);
  target.classList.toggle('ss-pinging',state==='pinging');target.classList.toggle('ss-done',state==='done');
  const status=target.querySelector('.ss-node-status');status.textContent=state==='done'?'✓':state==='skipped'?'–':'·';
  status.setAttribute('aria-label',state==='done'?'Complete':state==='pinging'?'Checking':state==='skipped'?'Not required':'Pending');
 }
 new ResizeObserver(drawWires).observe(map);
 document.fonts.ready.then(drawWires);

 function render(){
  const c=calls[call];root.dataset.phase=String(phase);root.dataset.call=c.key;root.dataset.critical=String(c.critical);
  const explanations=[
   ['The agent prepares a call.',`${c.name} is proposed. The outbound request is held before execution.`],
   ['Guardrails check the proposed action.',c.policy],
   ['Intent & context are restored.',c.context],
   ['The agent critiques its own proposal.',c.critique],
   ['Hold for human approval.',c.review+' This approval event is fictional.'],
   ['Release the supervised call.',c.critical?`All checks and scripted human approval are complete for ${c.name}. Only now is the financial action released.`:`Automated checks passed for ${c.name}. Policy allows this read-only call without human approval.`],
   ['Observe the execution result.',c.result+'. '+c.evidence+'. These are fictional outcomes.'],
   ['Carry the intent into the next call.','Sidecar re-injects the original goal, relevant evidence and this result before the next proposal starts.']
  ];
  set('[data-ss-proposal]',c.proposal);set('[data-ss-agent-state]',phase===0?'PREPARING PROPOSAL':phase>=5?'SUPERVISED CALL':'AWAITING SUPERVISION');
  set('[data-ss-phase]',`${String(phase+1).padStart(2,'0')} / ${names[phase].toUpperCase()}`);
  set('[data-ss-heading]',explanations[phase][0]);set('[data-ss-detail]',explanations[phase][1]);
  set('[data-ss-cycle]',`CALL ${String(call+1).padStart(2,'0')} / 04`);
  set('[data-ss-context]',phase===2||phase===7?'Context re-injected':'Context attached');
  checkKeys.forEach((key,i)=>{
   const skipped=key==='approval'&&!c.critical;
   const active=!skipped&&phase===i+1,done=!skipped&&phase>i+1;
   const card=root.querySelector(`[data-ss-check="${key}"]`);card.classList.toggle('active',active);card.classList.toggle('complete',done);card.classList.toggle('not-required',skipped);
   wireState(key,skipped?'skipped':active?'pinging':done?'done':'pending');
   set(`[data-ss-check-status="${key}"]`,skipped?'NOT REQUIRED · READ ONLY':active?(key==='approval'?'SCRIPTED REVIEW':'CHECKING'):done?(key==='approval'?'SCRIPTED APPROVAL':'PASSED'):'WAITING');
  });
  root.querySelectorAll('[data-ss-target]').forEach(node=>{const selected=node.dataset.ssTarget===c.key;wireState(node.dataset.ssTarget,selected&&phase===5?'pinging':selected&&phase>=6?'done':'pending');node.classList.toggle('executing',selected&&phase>=5);node.classList.toggle('queued',selected&&phase<5);node.querySelector('small').textContent=selected?(phase<5?'HELD':phase===5?'CALLING':'COMPLETE'):'IDLE';});
  const released=phase>=5;root.querySelector('[data-ss-gate]').classList.toggle('released',released);
  set('[data-ss-gate] strong',released?'Execution gate released':'Execution gate held');
  set('[data-ss-gate] span',released?(c.critical?'Checks passed · scripted approval recorded.':'Checks passed · read-only call allowed by policy.'):(c.critical?'Critical financial action held for checks and approval.':'Read-only call held for automated checks; no human approval needed.'));
  set('[data-ss-result]',phase>=6?c.result:phase===5?'Supervised call in progress':'No outbound call yet');
  set('[data-ss-evidence]',phase>=6?c.evidence:phase===5?(c.critical?'Fictional critical action after scripted approval.':'Fictional read-only call after automated checks.'):(c.critical?'Awaiting checks and scripted human approval.':'Awaiting automated checks only.'));
  root.querySelector('.ss-progress>span').style.width=((phase+1)/8*100)+'%';
  root.querySelectorAll('.ss-phase-track li').forEach((n,i)=>{n.classList.toggle('active',i===phase);n.classList.toggle('not-required',i===4&&!c.critical);n.textContent=i===4&&!c.critical?'Approval skipped':names[i];});
 }
 function schedule(){clearTimeout(timer);const running=visible&&!document.hidden&&!reduced.matches;root.classList.toggle('ss-playing',running);if(running)timer=setTimeout(()=>{if(!visible||document.hidden||reduced.matches){schedule();return;}phase++;if(phase===4&&!calls[call].critical)phase=5;if(phase===8){phase=0;call=(call+1)%calls.length;}render();schedule();},1000);}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0.1});observer.observe(root);
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{set('[data-ss-playback]',reduced.matches?'Static overview · reduced motion':'Automatic playback · 1s / stage');schedule();});
 set('[data-ss-playback]',reduced.matches?'Static overview · reduced motion':'Automatic playback · 1s / stage');
 render();drawWires();schedule();
})();
