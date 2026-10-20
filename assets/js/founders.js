document.querySelectorAll('.founder-flip').forEach((card) => {
  const button = card.querySelector('.founder-bio-toggle');
  const bio = card.querySelector('.founder-flip-back');
  const portrait = card.querySelector('.founder-flip-front');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let pinned = false;
  let hovering = false;
  const render = () => {
    const open = pinned || hovering;
    card.classList.toggle('is-flipped', open);
    button.setAttribute('aria-expanded', String(open));
    button.innerHTML = open ? 'Show photo <span aria-hidden="true">↶</span>' : 'Read bio <span aria-hidden="true">↗</span>';
    bio.inert = !open;
    portrait.inert = open;
  };
  card.addEventListener('pointerenter', () => {
    if (hover.matches) { hovering = true; render(); }
  });
  card.addEventListener('pointerleave', () => { hovering = false; render(); });
  button.addEventListener('click', () => {
    if (pinned || hovering) { pinned = false; hovering = false; }
    else { pinned = true; }
    render();
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { pinned = false; hovering = false; render(); button.focus(); }
  });
});
