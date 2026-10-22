/* Interactive explanation for the code-rendered AgenticOps loop. */
(() => {
  const diagram = document.querySelector('.ops-figure');
  if (!diagram) return;
  const stages = {
  "production": {
    "title": "Production",
    "detail": "A user request starts a production workflow. Agents coordinate, invoke models and tools, and produce an outcome."
  },
  "lens": {
    "title": "AgenticLens",
    "detail": "Capture agent handoffs, model and tool calls, errors, latency and token usage as evidence of what happened."
  },
  "spec": {
    "title": "AI Operations Specification",
    "detail": "Represent the recorded execution in a shared format so its context and evidence can move between operational tools."
  },
  "record": {
    "title": "Recorded scenario",
    "detail": "Preserve the original request, execution evidence and metadata as a reusable scenario. A recording is evidence; it is not a new execution."
  },
  "replay": {
    "title": "Replay in dev / test",
    "detail": "Run the scenario against an application version in a controlled environment. Replay creates a new execution; evaluating a recording only scores existing evidence."
  },
  "chaos": {
    "title": "Agentic-Chaos",
    "detail": "During sandbox replay, introduce controlled dependency failures, timeouts or corrupted context and observe recovery behavior."
  },
  "evals": {
    "title": "Agentic-Evals",
    "detail": "Score the recorded execution or a newly replayed execution for quality, task completion, tool use, coordination, safety and efficiency. Evaluation does not itself replay the application."
  },
  "analyze": {
    "title": "Analyze the evidence",
    "detail": "Bring evaluation scores and resilience evidence together. Compare agents, identify failure modes, find bottlenecks and examine quality regressions."
  },
  "optimize": {
    "title": "Optimize agents",
    "detail": "Use the findings to adjust prompts, models, tools, routing, policies or memory. Improvements are hypotheses until they are tested again."
  },
  "validate": {
    "title": "Re-test / validate",
    "detail": "Replay and evaluate the candidate again, checking both improvements and regressions before a release decision."
  },
  "deploy": {
    "title": "Deploy",
    "detail": "After validation and review, deploy the improved application. Its next production runs become new evidence for the loop. This conceptual demo performs no real deployment."
  }
};
  const phases = [['production'], ['lens'], ['spec'], ['record'], ['replay'], ['chaos','evals'], ['analyze'], ['optimize'], ['validate'], ['deploy']];
  const icons = {production:'◈',lens:'◎',spec:'⌘',record:'▤',replay:'↻',chaos:'ϟ',evals:'✓',analyze:'⌕',optimize:'✦',validate:'☑',deploy:'↗'};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 0, playing = !reduced.matches, visible = false, timer;
  diagram.classList.add('ops-enhanced');
  const toolbar = document.createElement('div');
  toolbar.className = 'ops-controls';
  toolbar.innerHTML = '<div class="ops-playback"><button type="button" data-loop-play></button><button type="button" data-loop-next aria-label="Next loop stage">Next stage →</button><button type="button" data-loop-reset aria-label="Restart loop">↺</button></div><span class="ops-playback-status"></span>';
  diagram.querySelector('figcaption').after(toolbar);
  diagram.querySelectorAll('[data-loop-stage]').forEach(button => {
    const icon = document.createElement('i');
    icon.className = 'ops-stage-icon'; icon.setAttribute('aria-hidden','true');
    icon.textContent = icons[button.dataset.loopStage];
    button.append(icon);
  });
  const ring = diagram.querySelector('.ops-center>span');
  ring.className = 'ops-orbit';
  ring.innerHTML = '<span class="ops-orbit-count"></span>';
  const progress = document.createElement('div');
  progress.className='ops-progress'; progress.innerHTML='<span></span>';
  toolbar.after(progress);
  // An overlay animates packets along the same source paths as the actual connectors.
  const svg = diagram.querySelector('.ops-connectors');
  const sourcePaths = [...svg.querySelectorAll('g>path')];
  const pathTargets = ['lens','spec','record','replay','optimize','validate','deploy','production','chaos','evals','analyze','analyze'];
  const ns = 'http://www.w3.org/2000/svg';
  const overlay = document.createElementNS(ns,'g');
  overlay.classList.add('ops-flow-packets'); overlay.setAttribute('fill','none');
  sourcePaths.forEach((path,index) => {
    path.dataset.target=pathTargets[index];
    const copy=path.cloneNode();
    copy.removeAttribute('marker-end'); copy.setAttribute('pathLength','100');
    copy.classList.add('ops-flow-packet'); overlay.append(copy);
  });
  svg.querySelector('g').after(overlay);
  function schedule() {
    clearTimeout(timer);
    const running = playing && visible && !document.hidden;
    diagram.classList.toggle('ops-playing',running);
    if(running) timer=setTimeout(()=>{phase=(phase+1)%phases.length;update();},1000);
  }
  function update(manual=false) {
    const active=phases[phase];
    diagram.querySelectorAll('[data-loop-stage]').forEach(button => {
      const selected=active.includes(button.dataset.loopStage);
      button.setAttribute('aria-pressed',String(selected));
      button.closest('.ops-stage').classList.toggle('ops-active',selected);
    });
    const detail=diagram.querySelector('#ops-loop-detail');
    detail.setAttribute('aria-live',manual?'polite':'off');
    detail.querySelector('.ops-detail-label').textContent='PHASE '+String(phase+1).padStart(2,'0')+' / '+phases.length;
    detail.querySelector('h3').textContent=active.length===2?'Stress-test & evaluate':stages[active[0]].title;
    detail.querySelector('p').textContent=active.length===2?'Two complementary checks feed the analysis: Agentic-Chaos introduces controlled failures during sandbox replay, while Agentic-Evals scores behavior and outcomes. Both provide evidence for the next improvement.':stages[active[0]].detail;
    const count=String(phase+1).padStart(2,'0');
    diagram.querySelector('.ops-orbit-count').textContent=count;
    ring.style.setProperty('--ops-progress',((phase+1)/phases.length*100)+'%');
    diagram.querySelector('.ops-center strong').textContent=active.length===2?'Stress-test & evaluate':stages[active[0]].title;
    diagram.querySelector('.ops-center p').textContent='Continuous AgenticOps feedback loop';
    diagram.querySelector('.ops-progress>span').style.width=((phase+1)/phases.length*100)+'%';
    diagram.querySelector('[data-loop-play]').textContent=playing?'Ⅱ Pause loop':'▶ Play loop';
    diagram.querySelector('[data-loop-play]').setAttribute('aria-pressed',String(playing));
    diagram.querySelector('.ops-playback-status').textContent=count+' / '+phases.length+' · '+(active.length===2?'Parallel checks':stages[active[0]].title);
    svg.querySelectorAll('[data-target]').forEach(path=>path.classList.toggle('ops-path-active',active.includes(path.dataset.target)));
    schedule();
  }
  diagram.addEventListener('click',event=>{
    const button=event.target.closest('button'); if(!button)return;
    if(button.hasAttribute('data-loop-play')) playing=!playing;
    else if(button.hasAttribute('data-loop-next')) {playing=false;phase=(phase+1)%phases.length;}
    else if(button.hasAttribute('data-loop-reset')) {playing=false;phase=0;}
    else if(button.dataset.loopStage) {
      playing=false;
      phase=phases.findIndex(items=>items.includes(button.dataset.loopStage));
      update(true);
      // Preserve the individual explanation when inspecting either parallel branch.
      const stage=stages[button.dataset.loopStage];
      diagram.querySelector('#ops-loop-detail h3').textContent=stage.title;
      diagram.querySelector('#ops-loop-detail p').textContent=stage.detail;
      return;
    } else return;
    update(true);
  });
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0.12});
  observer.observe(diagram);
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;update();}});
  update();
})();
