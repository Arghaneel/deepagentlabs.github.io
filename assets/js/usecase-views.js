/* Public page-load counters; previews never increment production totals. */
(() => {
  const paths = ["/usecases/1/", "/usecases/2/", "/usecases/3/", "/usecases/4/", "/usecases/5/", "/usecases/6/", "/agentic-sidecar/usecases/prevent-unauthorized-refunds/", "/agentic-sidecar/usecases/governed-customer-support-agent/", "/agentic-sidecar/usecases/govern-langgraph-agent-workflows/"];
  const normalize = path => path.replace(/index\.html$/, '').replace(/\/?$/, '/');
  const path = normalize(location.pathname);
  if (['deepagentlabs.io', 'www.deepagentlabs.io'].includes(location.hostname) && paths.includes(path)) {
    const pixel = new Image();
    pixel.referrerPolicy = 'no-referrer';
    pixel.src = 'https://hits.sh/deepagentlabs.io' + path.slice(0, -1) + '.svg';
  }
  const badges = document.querySelectorAll('[data-usecase-views]');
  if (!badges.length) return;
  fetch('/assets/data/usecase-views.json', { cache: 'no-cache' })
    .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
    .then(data => badges.forEach(badge => {
      const count = data.views[badge.dataset.usecaseViews];
      if (!Number.isSafeInteger(count) || count < 0) return;
      badge.textContent = new Intl.NumberFormat('en').format(count) + (count === 1 ? ' view' : ' views');
      badge.title = 'Page loads since counters were added. Updated ' + new Date(data.updatedAt).toLocaleString() + '. Totals refresh hourly.';
    }))
    .catch(() => {}); // An unavailable service must never break the page or invent a total.
})();
