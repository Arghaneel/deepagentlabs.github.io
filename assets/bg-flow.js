/* Page background animation: a few slow, faint signals that travel the grid like
   signals on a circuit board.
   Sits behind all content (pointer-events: none), pauses when the tab is hidden,
   and is skipped entirely for people who prefer reduced motion. */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "bg-flow";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const GRID = 52;
  // signal colour comes from the theme (--flow-rgb), defaulting to deep green
  const DARK = getComputedStyle(document.documentElement).getPropertyValue("--flow-rgb").trim() || "61,122,18";
  let w = 0, h = 0, dpr = 1, packets = [], running = true, last = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const spawn = () => {
    const cols = Math.ceil(w / GRID), rows = Math.ceil(h / GRID);
    const d = dirs[(Math.random() * 4) | 0];
    return {
      x: ((Math.random() * cols) | 0) * GRID,
      y: ((Math.random() * rows) | 0) * GRID,
      dx: d[0], dy: d[1],
      speed: rand(14, 26),           // px per second (slow and calm)
      trail: [],
      life: rand(12, 22),             // seconds before it respawns
      age: 0,
    };
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(10, Math.max(5, (w * h) / 160000)));
    packets = Array.from({ length: count }, spawn);
  };

  const step = (p, dt) => {
    p.age += dt;
    const move = p.speed * dt;
    const px = p.x, py = p.y;
    p.x += p.dx * move; p.y += p.dy * move;
    // at a grid intersection, maybe turn
    const crossedX = p.dx && Math.floor(px / GRID) !== Math.floor(p.x / GRID);
    const crossedY = p.dy && Math.floor(py / GRID) !== Math.floor(p.y / GRID);
    if ((crossedX || crossedY) && Math.random() < 0.3) {
      p.x = Math.round(p.x / GRID) * GRID; p.y = Math.round(p.y / GRID) * GRID;
      const turn = p.dx ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
      const t = turn[(Math.random() * 2) | 0];
      p.dx = t[0]; p.dy = t[1];
    }
    p.trail.push([p.x, p.y]);
    if (p.trail.length > 90) p.trail.shift();
    if (p.age > p.life || p.x < -GRID || p.y < -GRID || p.x > w + GRID || p.y > h + GRID) Object.assign(p, spawn());
  };

  const draw = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    ctx.clearRect(0, 0, w, h);

    packets.forEach((p) => {
      step(p, dt);
      const fade = Math.min(1, p.age / 0.6, (p.life - p.age) / 0.8);
      const n = p.trail.length;
      for (let i = 1; i < n; i++) {
        const a = (i / n) * 0.28 * fade;
        ctx.strokeStyle = `rgba(${DARK},${a})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(p.trail[i - 1][0], p.trail[i - 1][1]);
        ctx.lineTo(p.trail[i][0], p.trail[i][1]);
        ctx.stroke();
      }
      // head
      ctx.fillStyle = `rgba(${DARK},${0.5 * fade})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(draw); }
  });

  resize();
  last = performance.now();
  requestAnimationFrame(draw);
})();
