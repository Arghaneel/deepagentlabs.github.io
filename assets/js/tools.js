/* Tabbed tool showcase: hover (desktop), click or arrow keys to switch; auto-advances until the visitor interacts. */
(() => {
  const root = document.querySelector("[data-tl]");
  if (!root) return;
  const tabs = [...root.querySelectorAll(".tl-tab")];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INTERVAL = 6000;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  let index = 0;
  let timer = 0;
  let auto = !reduced;
  let visible = false;

  const select = (i, focus = false) => {
    index = (i + tabs.length) % tabs.length;
    tabs.forEach((t, n) => {
      const on = n === index;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[n].hidden = !on;
    });
    // restart the progress bar animation
    const bar = tabs[index].querySelector(".tl-progress");
    if (bar) {
      bar.style.animation = "none";
      bar.offsetWidth;
      bar.style.animation = "";
    }
    if (focus) tabs[index].focus();
    // keep the active tab in view on the horizontal (mobile) strip
    const strip = tabs[index].parentElement;
    if (strip.scrollWidth > strip.clientWidth) {
      strip.scrollTo({ left: tabs[index].offsetLeft - 16, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const schedule = () => {
    clearTimeout(timer);
    if (auto && visible) timer = setTimeout(() => { select(index + 1); schedule(); }, INTERVAL);
  };
  const stopAuto = () => {
    auto = false;
    root.classList.remove("is-auto");
    clearTimeout(timer);
  };

  root.style.setProperty("--tl-ms", `${INTERVAL}ms`);
  if (auto) root.classList.add("is-auto");

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => { stopAuto(); select(i); });
    // desktop: hovering a tool shows it straight away (short delay avoids flicker while sweeping past)
    let hoverTimer = 0;
    tab.addEventListener("mouseenter", () => {
      if (!canHover.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { stopAuto(); if (index !== i) select(i); }, 70);
    });
    tab.addEventListener("mouseleave", () => clearTimeout(hoverTimer));
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); stopAuto(); select(index + keys[e.key], true); }
      else if (e.key === "Home") { e.preventDefault(); stopAuto(); select(0, true); }
      else if (e.key === "End") { e.preventDefault(); stopAuto(); select(tabs.length - 1, true); }
    });
  });

  // pause while hovered, only run while on screen
  root.addEventListener("mouseenter", () => { clearTimeout(timer); root.classList.remove("is-auto"); });
  root.addEventListener("mouseleave", () => { if (auto) { root.classList.add("is-auto"); select(index); schedule(); } });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { select(index); schedule(); } else clearTimeout(timer); }, { threshold: 0.35 }).observe(root);
  } else { visible = true; schedule(); }
})();
