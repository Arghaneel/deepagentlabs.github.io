/* Product pages: fill [data-pp-usecases="<package id>"] with that package's use cases
   from assets/js/usecases-data.js, so the page and the Use cases menu stay in sync. */
(() => {
  const list = document.querySelector("[data-pp-usecases]");
  const pkg = (window.DAL_USECASES?.packages || []).find((p) => p.id === list?.dataset.ppUsecases);
  if (!list || !pkg) return;
  (pkg.useCases || []).forEach((uc) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = uc.href || `/${pkg.id}/usecases/${uc.slug}/`;
    a.textContent = `${uc.title} `;
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    a.append(arrow);
    li.append(a);
    list.append(li);
  });
})();

/* Reveal on scroll: section headings and card groups fade up as they come into view. */
(() => {
  const root = document.documentElement;
  const items = [...document.querySelectorAll(".pp-rv, .pp-rv-kids")];
  if (!items.length) return;
  const show = (el) => el.classList.add("is-in");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(show);
    return;
  }
  // stagger the children of each group
  document.querySelectorAll(".pp-rv-kids").forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  items.forEach((el) => io.observe(el));
  // safety net: never leave content hidden
  setTimeout(() => items.forEach(show), 4000);
  root.classList.add("pp-js");
})();

/* Live fleet card (example data): heartbeats arrive, "last seen" ages tick,
   and now and then an agent changes state; counts and the bar follow. */
(() => {
  const card = document.querySelector("[data-fleet]");
  if (!card || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rows = [...card.querySelectorAll("[data-fleet-rows] li")];
  const counts = { ok: 41, warn: 5, bad: 2 };
  const LABEL = { ok: "healthy", warn: "degraded", bad: "no heartbeat" };
  const age = rows.map((r) => {
    const t = r.querySelector("time").textContent;
    return t.endsWith("m") ? parseInt(t, 10) * 60 : parseInt(t, 10);
  });
  const fmt = (s) => (s >= 60 ? `${Math.floor(s / 60)}m` : `${s}s`);
  // "Recent activity" feed under the rows: newest on top, 3 lines
  const feedList = card.querySelector("[data-fleet-feed]");
  const feedAge = feedList ? [0, 12, 240] : [];
  const feedTime = (t) => (t < 3 ? "now" : fmt(t));
  const pushFeed = (cls, name, text) => {
    if (!feedList) return;
    const top = feedList.firstElementChild;
    if (top && top.querySelector("b")?.textContent === name && top.textContent.endsWith(text)) return; // no repeats
    const li = document.createElement("li");
    li.className = "is-new";
    li.innerHTML = `<time>now</time><b class="${cls}"></b> `;
    li.querySelector("b").textContent = name;
    li.append(text);
    feedList.prepend(li);
    feedAge.unshift(0);
    while (feedList.children.length > 3) { feedList.lastElementChild.remove(); feedAge.pop(); }
  };
  const NAME = (i) => rows[i].querySelector("span").textContent;
  const render = () => {
    Object.keys(counts).forEach((k) => {
      card.querySelector(`[data-count="${k}"]`).textContent = counts[k];
      card.querySelector(`[data-bar="${k}"]`).style.flexGrow = counts[k];
    });
  };
  const setState = (i, next) => {
    const r = rows[i];
    const prev = r.dataset.state;
    if (prev === next) return;
    counts[prev] -= 1;
    counts[next] += 1;
    r.dataset.state = next;
    r.querySelector("em").textContent = LABEL[next];
    r.classList.add("is-changed");
    pushFeed(next, NAME(i), next === "ok" ? "recovered → healthy" : next === "warn" ? (prev === "bad" ? "is back, still degraded" : "slowed down → degraded") : "stopped checking in");
    setTimeout(() => r.classList.remove("is-changed"), 1600);
    if (next !== "bad") age[i] = 0;
    render();
  };

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(card);
  let tick = 0;
  setInterval(() => {
    if (!visible || document.hidden || card.dataset.manual === "true") return;
    tick += 1;
    rows.forEach((r, i) => {
      const st = r.dataset.state;
      age[i] += 1;
      // healthy agents check in every few seconds, degraded ones slowly, unhealthy never
      const due = st === "ok" ? age[i] >= 3 + (i % 3) : st === "warn" ? age[i] >= 11 : false;
      if (due) {
        age[i] = 0;
        r.classList.remove("is-beat");
        void r.offsetWidth;
        r.classList.add("is-beat");
        if (Math.random() < 0.3 && feedList?.firstElementChild?.querySelector("b")?.textContent !== NAME(i)) pushFeed(st, NAME(i), st === "ok" ? "sent a heartbeat" : "checked in late");
      }
      r.querySelector("time").textContent = fmt(age[i]);
    });
    if (feedList) [...feedList.children].forEach((li, k) => {
      feedAge[k] += 1;
      li.querySelector("time").textContent = feedTime(feedAge[k]);
      if (feedAge[k] > 1) li.classList.remove("is-new");
    });
    // every ~6s something changes: degraded recovers, a healthy one slows down, or the silent one comes back
    if (tick % 6 === 0) {
      const warn = rows.findIndex((r) => r.dataset.state === "warn");
      const bad = rows.findIndex((r) => r.dataset.state === "bad");
      const roll = Math.random();
      if (bad > -1 && roll < 0.25) setState(bad, "warn");
      else if (warn > -1 && roll < 0.6) setState(warn, "ok");
      else {
        const healthy = rows.map((r, i) => (r.dataset.state === "ok" ? i : -1)).filter((i) => i > -1);
        if (healthy.length > 1) setState(healthy[Math.floor(Math.random() * healthy.length)], "warn");
      }
      // keep at least one unhealthy example on screen most of the time
      if (!rows.some((r) => r.dataset.state === "bad") && Math.random() < 0.5) {
        const w = rows.findIndex((r) => r.dataset.state === "warn");
        if (w > -1) { setState(w, "bad"); age[w] = 180; }
      }
    }
  }, 1000);
})();

/* "Inside the console": the list moves to the next screen on its own every few seconds
   (progress bar on the active item) and loops. Clicking an item jumps to it and the cycle
   carries on from there. It only runs while the section is on screen, and pauses while a
   screenshot is enlarged. Arrow keys move between screens. Off with "reduce motion". */
(() => {
  const box = document.querySelector("[data-pp-tabs]");
  if (!box) return;
  const tabs = [...box.querySelectorAll('[role="tab"]')];
  const STEP = 5000; // ms per screen
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
  let elapsed = 0, last = 0, paused = false, visible = false;

  const select = (i, focus) => {
    current = (i + tabs.length) % tabs.length;
    elapsed = 0;
    tabs.forEach((t, k) => {
      const on = k === current;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      t.style.setProperty("--p", on && !calm ? 0 : 1);
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.toggle("is-on", on);
    });
    if (focus) tabs[current].focus();
  };

  const loop = (now) => {
    requestAnimationFrame(loop);
    const dt = last ? now - last : 0;
    last = now;
    if (paused || !visible || document.hidden) return;
    elapsed += dt;
    tabs[current].style.setProperty("--p", Math.min(elapsed / STEP, 1));
    if (elapsed >= STEP) select(current + 1);
  };

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault(); select(i + d, true);
    });
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.2 }).observe(box);
  select(current);
  if (!calm) requestAnimationFrame(loop);

  // click to enlarge
  const zoom = document.createElement("div");
  zoom.className = "pp-zoom";
  zoom.hidden = true;
  zoom.setAttribute("role", "dialog");
  zoom.setAttribute("aria-modal", "true");
  zoom.setAttribute("aria-label", "Enlarged screenshot");
  zoom.innerHTML = '<img alt=""><button type="button" aria-label="Close">×</button>';
  document.body.append(zoom);
  const zimg = zoom.querySelector("img");
  let opener = null;
  const close = () => { zoom.hidden = true; paused = false; opener?.focus(); };
  box.querySelectorAll(".pp-show-stage figure").forEach((fig) => {
    fig.tabIndex = 0;
    const open = () => {
      const img = fig.querySelector("img");
      zimg.src = img.currentSrc || img.src;
      zimg.alt = img.alt;
      opener = fig; paused = true;
      zoom.hidden = false;
      zoom.querySelector("button").focus();
    };
    fig.addEventListener("click", open);
    fig.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  zoom.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !zoom.hidden) close(); });
})();

/* "What it does" carousel: arrows, a progress line that follows the scroll, and drag-to-scroll with a mouse. */
(() => {
  const track = document.querySelector("[data-pp-carousel]");
  if (!track) return;
  const bar = document.querySelector("[data-pp-progress]");
  const prev = document.querySelector("[data-pp-prev]");
  const next = document.querySelector("[data-pp-next]");
  const step = () => (track.querySelector(".pp-fc")?.getBoundingClientRect().width || 400) + 24;
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const frac = track.clientWidth / track.scrollWidth;
    const pos = max > 0 ? track.scrollLeft / max : 0;
    if (bar) {
      bar.style.width = `${Math.max(frac, 0.12) * 100}%`;
      bar.style.transform = `translateX(${pos * (1 / Math.max(frac, 0.12) - 1) * 100}%)`;
    }
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max - 2;
  };
  prev?.addEventListener("click", () => track.scrollBy({ left: -step() }));
  next?.addEventListener("click", () => track.scrollBy({ left: step() }));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: step() }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -step() }); }
  });
  track.addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  // drag with the mouse (touch already scrolls natively)
  let down = false, startX = 0, startLeft = 0, moved = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    e.preventDefault();
    down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
  });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) { moved = true; track.classList.add("is-drag"); }
    if (moved) track.scrollLeft = startLeft - dx;
  });
  addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    if (moved) {
      track.classList.remove("is-drag");
      const i = Math.round(track.scrollLeft / step());
      track.scrollTo({ left: i * step() });
      setTimeout(() => { moved = false; }, 0);
    }
  });
  track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  update();
})();

/* Numbers strip: count up from 0 when it comes into view. */
(() => {
  const nums = [...document.querySelectorAll("[data-count-to]")];
  if (!nums.length || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  nums.forEach((n) => { n.textContent = "0"; });
  const run = () => {
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min((now - t0) / 1000, 1);
      const ease = 1 - Math.pow(1 - k, 3);
      nums.forEach((n) => { n.textContent = Math.round(+n.dataset.countTo * ease); });
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.2 });
  io.observe(nums[0].closest("ul"));
})();
