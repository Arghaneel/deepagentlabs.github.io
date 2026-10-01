/* Roadmap: animate progress bars, reveal timeline items, fill the timeline line on scroll. */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasIO = "IntersectionObserver" in window;

  const onVisible = (els, fn, threshold) => {
    if (!hasIO || reduced) return els.forEach(fn);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          fn(e.target);
          io.unobserve(e.target);
        }),
      { threshold },
    );
    els.forEach((el) => io.observe(el));
  };

  // Progress bars (homepage rail + roadmap page meter)
  onVisible([...document.querySelectorAll("[data-rm-animate]")], (el) => el.classList.add("is-live"), 0.4);

  // Everything below is roadmap.html only
  const page = document.querySelector(".rm-page");
  if (!page) return;
  document.documentElement.classList.add("js");

  const items = [...page.querySelectorAll("[data-rv]")];
  onVisible(items, (el) => el.classList.add("in"), 0.15);

})();
