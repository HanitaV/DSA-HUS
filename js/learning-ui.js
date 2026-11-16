/**
 * Education-first shell for the existing knowledge-map application.
 * Additive only: existing IDs, URL hashes, graph, labs, visualizers and
 * progress storage remain owned by app.js / lesson.js.
 */
const $ = selector => document.querySelector(selector);

function setupLesson() {
  const content = $('#lesson-content');
  if (!content) return;
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<div class="reading-progress-fill"></div>';
  document.body.prepend(bar);
  let raf = false;
  const update = () => {
    raf = false;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = height > 0 ? Math.min(100, Math.max(0, (window.scrollY / height) * 100)) : 0;
    bar.firstElementChild.style.width = pct.toFixed(1) + '%';
  };
  window.addEventListener('scroll', () => {
    if (!raf) { raf = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

if (document.body.classList.contains('lesson-page')) {
  setupLesson();
}
