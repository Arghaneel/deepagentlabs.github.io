/* Capability map compact view: shows the first four capabilities per package and hides
   outputs until the visitor expands the map (or selects a package). */
(() => {
  const figure = document.querySelector(".architecture-figure");
  const toolbar = figure?.querySelector(".arch-toolbar");
  if (!figure || !toolbar) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "arch-expand";
  button.setAttribute("aria-pressed", "false");
  button.innerHTML = '<span aria-hidden="true">＋</span> <span class="arch-expand-label">Full detail</span>';
  toolbar.prepend(button);

  const label = button.querySelector(".arch-expand-label");
  const icon = button.querySelector("span");
  button.addEventListener("click", () => {
    const expanded = figure.classList.toggle("arch-is-expanded");
    button.setAttribute("aria-pressed", String(expanded));
    label.textContent = expanded ? "Compact view" : "Full detail";
    icon.textContent = expanded ? "－" : "＋";
  });

  // Make it obvious the map is interactive: a hint bar above the map, and the details panel
  // is brought into view (and flashes) whenever something is selected.
  const infographic = figure.querySelector(".arch-infographic");
  const panel = figure.querySelector(".arch-panel");
  const hint = document.createElement("p");
  hint.className = "arch-hint";
  hint.innerHTML = '<span class="arch-hint-dot" aria-hidden="true"></span><strong>Interactive map.</strong> Click any box, capability or framework to see what it does and what it connects to.';
  infographic?.before(hint);

  const emptyMsg = figure.querySelector(".arch-panel-empty");
  if (emptyMsg) emptyMsg.innerHTML = '<span class="arch-panel-point" aria-hidden="true">↑</span> Click any card in the map above to see its role, version and connections here.';

  let touched = false;
  figure.querySelector(".arch-artwork")?.addEventListener("click", (e) => {
    if (!e.target.closest("button,[data-arch-node],[role=button]")) return;
    if (!touched) { touched = true; figure.classList.add("arch-touched"); }
    if (!panel) return;
    panel.classList.remove("arch-panel-flash");
    void panel.offsetWidth;
    panel.classList.add("arch-panel-flash");
    const r = panel.getBoundingClientRect();
    if (r.top > window.innerHeight - 120) {
      panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
    }
  });

  // "+N more" hints under each package's capability list (added once the map has rendered)
  const addHints = () => {
    const lists = figure.querySelectorAll(".arch-capabilities");
    if (!lists.length) return false;
    lists.forEach((list) => {
      if (list.querySelector(".arch-more")) return;
      const extra = list.querySelectorAll(".arch-capability").length - 4;
      if (extra > 0) {
        const hint = document.createElement("span");
        hint.className = "arch-more";
        hint.setAttribute("aria-hidden", "true");
        hint.textContent = `+${extra} more · select to see all`;
        list.appendChild(hint);
      }
    });
    return true;
  };
  if (!addHints()) {
    const mo = new MutationObserver(() => { if (addHints()) mo.disconnect(); });
    mo.observe(figure, { childList: true, subtree: true });
  }
})();
