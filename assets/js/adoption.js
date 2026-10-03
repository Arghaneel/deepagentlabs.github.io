/* Ecosystem adoption: one stat card. Fetches each package's all-time PyPI downloads from
   Pepy badges (with fallback numbers), then — the first time the card scrolls into view —
   counts every number up from 0. */
(() => {
  const section = document.querySelector("#adoption");
  const card = section?.querySelector("[data-adp]");
  if (!card) return;

  const packages = [
    { slug: "agenticlens", name: "AgenticLens", fallbackDownloads: 122300 },
    { slug: "deep-agentic-core-mcp", name: "Deep Agentic Core MCP", fallbackDownloads: 103800 },
    { slug: "agentic-chaos", name: "Agentic Chaos", fallbackDownloads: 90900 },
    { slug: "agentic-sidecar", name: "Agentic Sidecar", fallbackDownloads: 22000 },
    { slug: "agenticops-control-tower", name: "AgenticOps Control Tower", fallbackDownloads: null },
    { slug: "agentic-evals", name: "Agentic Evals", fallbackDownloads: 7800 },
  ];

  const grid = card.querySelector("#adp-grid");
  const totalEl = card.querySelector("#adp-total");
  const status = card.querySelector("#adoption-data-status");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const records = new Map();
  let dataReady = false;
  let seen = false;
  let played = false;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  const full = (v) => new Intl.NumberFormat("en-US").format(v);

  const parseBadgeCount = (svgText) => {
    const svg = new DOMParser().parseFromString(svgText, "image/svg+xml");
    if (svg.querySelector("parsererror") || svg.documentElement.localName !== "svg") throw new Error("bad badge");
    const counts = [...svg.querySelectorAll("text")]
      .map((t) => t.textContent.trim().match(/^([\d,.]+)\s*([kmb]?)$/i))
      .filter(Boolean)
      .map((m) => Math.round(Number(m[1].replaceAll(",", "")) * { "": 1, k: 1e3, m: 1e6, b: 1e9 }[m[2].toLowerCase()]))
      .filter(Number.isFinite);
    if (!counts.length) throw new Error("no count");
    return counts.at(-1);
  };

  // one stat cell per package
  packages.forEach((item) => {
    records.set(item.slug, { item, count: null, source: "loading" });
    const li = el("li", "adp-stat");
    li.dataset.slug = item.slug;
    const a = el("div", "adp-link");
    const bar = el("span", "adp-bar");
    bar.setAttribute("aria-hidden", "true");
    bar.append(el("i"));
    const links = el("span", "adp-links");
    const pypi = el("a", "adp-pypi", "PyPI ↗");
    pypi.href = `https://pypi.org/project/${item.slug}/`;
    pypi.target = "_blank";
    pypi.rel = "noopener noreferrer";
    pypi.setAttribute("aria-label", `${item.name} on PyPI`);
    const stats = el("a", "adp-stats", "Download stats ↗");
    stats.href = `https://pepy.tech/projects/${item.slug}`;
    stats.target = "_blank";
    stats.rel = "noopener noreferrer";
    stats.setAttribute("aria-label", `${item.name} download statistics on Pepy`);
    links.append(pypi, stats);
    a.append(el("strong", "adp-num", "0"), el("span", "adp-name", item.name), el("code", "adp-slug", item.slug), bar, links);
    li.append(a);
    grid.append(li);
  });

  const countUp = (node, value, delay, prefix) => {
    if (!Number.isFinite(value)) { node.textContent = "—"; return; }
    if (reduced) { node.textContent = prefix + compact(value); return; }
    const duration = 1700;
    const start = performance.now() + delay;
    const tick = (now) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 4);
      node.textContent = prefix + compact(Math.round(value * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    node.textContent = prefix + "0";
    requestAnimationFrame(tick);
  };

  const play = () => {
    if (played || !dataReady || !seen) return;
    played = true;
    card.classList.add("is-counting");
    const list = [...records.values()];
    const available = list.filter((r) => Number.isFinite(r.count));
    const total = available.reduce((s, r) => s + r.count, 0);
    const max = Math.max(1, ...available.map((r) => r.count));

    // order by downloads, unavailable last
    list.sort((a, b) => (b.count ?? -1) - (a.count ?? -1)).forEach((r, i) => {
      const li = grid.querySelector(`[data-slug="${r.item.slug}"]`);
      grid.append(li);
      li.style.setProperty("--ratio", Number.isFinite(r.count) ? String(r.count / max) : "0");
      li.style.setProperty("--d", `${i * 90}ms`);
      li.dataset.state = r.source;
      li.querySelector(".adp-num").setAttribute("aria-label", Number.isFinite(r.count) ? `About ${full(r.count)} PyPI downloads` : "Statistics unavailable");
      countUp(li.querySelector(".adp-num"), r.count, 250 + i * 90, "~");
    });
    totalEl.setAttribute("aria-label", `About ${full(total)} downloads`);
    countUp(totalEl, total, 0, "~");
  };

  const load = async (item) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    try {
      const res = await fetch(`https://api.pepy.tech/badge/${item.slug}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(String(res.status));
      records.set(item.slug, { item, count: parseBadgeCount(await res.text()), source: "pepy" });
    } catch {
      records.set(item.slug, {
        item,
        count: item.fallbackDownloads,
        source: Number.isFinite(item.fallbackDownloads) ? "fallback" : "unavailable",
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let loading = false;
  const startLoading = () => {
    if (loading) return;
    loading = true;
    Promise.all(packages.map(load)).then(() => {
      const live = [...records.values()].filter((r) => r.source === "pepy").length;
      status.textContent = live === packages.length
        ? "Live PyPI downloads · Pepy data, cached up to 12h"
        : live > 0
          ? `Live PyPI downloads · ${live}/${packages.length} live, rest from latest snapshot`
          : "PyPI downloads · latest available snapshot";
      dataReady = true;
      play();
    });
  };

  if ("IntersectionObserver" in window) {
    // fetch a little before the card arrives…
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { startLoading(); obs.disconnect(); }
    }, { rootMargin: "400px 0px" }).observe(card);
    // …but only start counting once it is really on screen
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { seen = true; play(); obs.disconnect(); }
    }, { threshold: 0.2 }).observe(card);
  } else {
    seen = true;
    startLoading();
  }
})();
