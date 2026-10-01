/* Mega-menu: hover to open on desktop, click/tap to toggle everywhere, Esc / outside click to close. */
(() => {
  const items = [...document.querySelectorAll(".nav-item.has-mega")];
  if (!items.length) return;

  const desktop = window.matchMedia("(min-width: 821px) and (hover: hover)");
  const scrim = document.createElement("div");
  scrim.className = "mega-scrim";
  scrim.setAttribute("aria-hidden", "true");
  document.body.appendChild(scrim);

  // sliding highlight behind the top-level menu items (desktop)
  const header = document.querySelector(".site-header");
  const navEl = document.querySelector("#site-nav");
  const glider = document.createElement("span");
  glider.className = "nav-glider";
  glider.setAttribute("aria-hidden", "true");
  header?.appendChild(glider);
  const tops = navEl
    ? [...navEl.querySelectorAll(":scope > a:not(.nav-cta), :scope > .nav-item > .nav-trigger")]
    : [];
  const moveTo = (el) => {
    if (!el || !header || !desktop.matches) return;
    const h = header.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const first = !glider.classList.contains("is-on");
    if (first) glider.style.transition = "none"; // appear in place, then slide afterwards
    glider.style.width = `${r.width + 26}px`;
    glider.style.transform = `translateX(${r.left - h.left - 13}px)`;
    glider.style.top = `${r.top - h.top + r.height / 2}px`;
    glider.classList.toggle("is-menu", !!el.closest(".nav-item.is-open"));
    if (first) {
      glider.offsetWidth; // flush
      glider.style.transition = "";
    }
    glider.classList.add("is-on");
  };
  const settle = () => {
    const t = openItem?.querySelector(".nav-trigger");
    if (t) moveTo(t);
    else glider.classList.remove("is-on", "is-menu");
  };
  tops.forEach((el) => {
    el.addEventListener("mouseenter", () => moveTo(el));
    el.addEventListener("focus", () => {
      if (el.matches(":focus-visible")) moveTo(el);
    });
  });
  navEl?.addEventListener("mouseleave", () => setTimeout(settle, 220));
  navEl?.addEventListener("focusout", (e) => {
    if (!navEl.contains(e.relatedTarget)) setTimeout(settle, 0);
  });
  window.addEventListener("resize", () => glider.classList.remove("is-on"));

  let openItem = null;
  let openTimer = 0;
  let closeTimer = 0;

  const setOpen = (item, open) => {
    item.classList.toggle("is-open", open);
    item.querySelector(".nav-trigger")?.setAttribute("aria-expanded", String(open));
  };

  const close = (item = openItem) => {
    if (!item) return;
    setOpen(item, false);
    if (openItem === item) openItem = null;
    if (!openItem) scrim.classList.remove("is-on");
    glider.classList.remove("is-menu");
    if (!navEl?.matches(":hover")) settle();
  };

  const open = (item) => {
    if (openItem && openItem !== item) close(openItem);
    setOpen(item, true);
    openItem = item;
    if (desktop.matches) scrim.classList.add("is-on");
    moveTo(item.querySelector(".nav-trigger"));
  };

  items.forEach((item) => {
    const trigger = item.querySelector(".nav-trigger");

    trigger?.addEventListener("click", () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      item.classList.contains("is-open") ? close(item) : open(item);
    });

    item.addEventListener("mouseenter", () => {
      if (!desktop.matches) return;
      clearTimeout(closeTimer);
      // switch instantly between menus; small delay when opening from nothing
      openTimer = setTimeout(() => open(item), openItem ? 0 : 80);
    });

    item.addEventListener("mouseleave", () => {
      if (!desktop.matches) return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => close(item), 200);
    });

    // close when keyboard focus leaves the menu
    item.addEventListener("focusout", (e) => {
      if (desktop.matches && !item.contains(e.relatedTarget)) close(item);
    });

    // following a link closes the menu (and the mobile nav via site.js)
    item.querySelectorAll(".mega a").forEach((a) => a.addEventListener("click", () => close(item)));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !openItem) return;
    const trigger = openItem.querySelector(".nav-trigger");
    close();
    trigger?.focus();
  });

  document.addEventListener("click", (e) => {
    if (openItem && !openItem.contains(e.target)) close();
  });

  // reset when switching between mobile and desktop layouts
  desktop.addEventListener?.("change", () => close());
})();
