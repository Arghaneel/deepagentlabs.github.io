/* Builds the Use cases dropdown from assets/js/usecases-data.js, in the same layout as the
   Products and Docs menus: one item per package (icon, "<name> use cases", summary line).
   Fills  [data-uc-list]  (the grid) and  [data-uc-most-asked]  (chips in the dark card).
   Edit the data file, not this one. */
(() => {
  const data = window.DAL_USECASES;
  const list = document.querySelector("[data-uc-list]");
  const chips = document.querySelector("[data-uc-most-asked]");
  if (!data || !Array.isArray(data.packages) || !list) return;

  // same icons as the Products menu
  const ICONS = {
    "agenticlens": '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/><circle cx="11" cy="11" r="2"/>',
    "agentic-chaos": '<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9z"/>',
    "agentic-sidecar": '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
    "agentic-evals": '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    "mcp": '<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7zM12 16v5"/>',
    "control-tower": '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'
  };
  const FALLBACK_ICON = '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>';

  const packageHref = (pkg) => pkg.href || `/${pkg.id}/usecases/`;
  const useCaseHref = (pkg, uc) => uc.href || `/${pkg.id}/usecases/${uc.slug}/`;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  const items = document.createDocumentFragment();
  const featured = document.createDocumentFragment();

  data.packages.forEach((pkg) => {
    const li = el("li");
    const a = el("a", "mega-link");
    a.href = packageHref(pkg);

    const icon = el("span", "mega-icon");
    icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[pkg.id] || FALLBACK_ICON}</svg>`;

    const text = el("span", "mega-text");
    const title = el("strong", "", `${pkg.name} use cases `);
    const arrow = el("i", "", "→");
    arrow.setAttribute("aria-hidden", "true");
    title.append(arrow);
    text.append(title);
    if (pkg.summary) text.append(el("small", "", pkg.summary));

    a.append(icon, text);
    li.append(a);
    items.append(li);

    (pkg.useCases || []).forEach((uc) => {
      if (!uc.mostAsked) return;
      const chip = el("a", "", `${uc.mostAsked} `);
      chip.href = useCaseHref(pkg, uc);
      const go = el("span", "", "→");
      go.setAttribute("aria-hidden", "true");
      chip.append(go);
      featured.append(chip);
    });
  });

  list.replaceChildren(items);
  if (chips) chips.replaceChildren(featured);
})();
