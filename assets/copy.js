/* Adds a "copy" button to the right of every install command (pip install …). */
(() => {
  const targets = document.querySelectorAll("code.tl-pip, .mega-code, .dash-quickstart");
  if (!targets.length) return;

  const ICON_COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>';
  const ICON_DONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback for file:// pages or older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  };

  targets.forEach((el) => {
    if (el.querySelector(".copy-btn")) return;
    const text = el.textContent.trim();
    const label = document.createElement("span");
    label.className = "copy-text";
    label.textContent = text;
    el.textContent = "";
    el.classList.add("has-copy");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.setAttribute("aria-label", `Copy “${text}”`);
    btn.innerHTML = ICON_COPY + '<span class="copy-tip">Copy</span>';
    let timer = 0;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ok = await copyText(text);
      btn.classList.toggle("is-copied", ok);
      btn.innerHTML = (ok ? ICON_DONE : ICON_COPY) + `<span class="copy-tip">${ok ? "Copied" : "Press Ctrl+C"}</span>`;
      btn.setAttribute("aria-label", ok ? "Copied to clipboard" : `Copy “${text}”`);
      if (!ok) {
        const range = document.createRange();
        range.selectNodeContents(label);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.innerHTML = ICON_COPY + '<span class="copy-tip">Copy</span>';
        btn.setAttribute("aria-label", `Copy “${text}”`);
      }, 1800);
    });

    el.append(label, btn);
  });
})();
