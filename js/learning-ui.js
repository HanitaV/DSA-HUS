/**
 * Education-first shell for the existing knowledge-map application.
 * Additive only: existing IDs, URL hashes, graph, labs, visualizers and
 * progress storage remain owned by app.js / lesson.js.
 */
import { loadData, progress } from './common.js';
import { ready, route } from './model.mjs';

const $ = selector => document.querySelector(selector);

function createDashboard() {
  const heading = $('.workspace-heading');
  if (!heading || $('#study-dashboard')) return;
  const host = document.createElement('section');
  host.id = 'study-dashboard';
  host.className = 'study-dashboard';
  host.setAttribute('aria-label', 'Bắt đầu hành trình học');
  host.innerHTML = `
    <div class="study-lead">
      <span class="study-kicker"><span aria-hidden="true">✦</span> LỘ TRÌNH HỌC TẬP</span>
      <h2>Học để hiểu. Thử để nhớ.</h2>
      <p>Chọn một chủ đề, quan sát từng bước và tự viết code ngay trong trình duyệt.</p>
      <div class="study-actions">
        <a id="study-next" class="study-primary" href="index.html#course=MAT3514">Bắt đầu học <span aria-hidden="true">→</span></a>
        <a class="study-outline" href="#graph">Khám phá bản đồ</a>
      </div>
    </div>
    <div class="study-status">
      <span class="study-status-label">TIẾN ĐỘ CỦA BẠN</span>
      <div class="study-progress-number"><strong id="study-count">0</strong><span id="study-total">/ 104 chủ đề</span></div>
      <progress id="study-progress" value="0" max="100" aria-label="Tiến độ học tập"></progress>
      <p id="study-next-caption">Các bài đã học được lưu trên thiết bị này.</p>
      <div class="study-course-links">
        <a href="index.html#course=MAT3514">MAT3514 <span aria-hidden="true">↗</span></a>
        <a href="index.html#course=MAT3504">MAT3504 <span aria-hidden="true">↗</span></a>
      </div>
    </div>`;
  heading.after(host);
  const steps = document.createElement('div');
  steps.className = 'study-process';
  steps.setAttribute('aria-label', 'Ba bước học tập');
  steps.innerHTML = `
    <span><b>01</b> Khám phá kiến thức</span>
    <span class="study-separator" aria-hidden="true">→</span>
    <span><b>02</b> Xem mô phỏng</span>
    <span class="study-separator" aria-hidden="true">→</span>
    <span><b>03</b> Tự viết &amp; kiểm tra code</span>`;
  host.after(steps);
}

async function fillDashboard() {
  if (!$('#study-dashboard')) return;
  try {
    const data = await loadData();
    const ordered = data.courses
      .flatMap(c => c.chapters.flatMap(ch => ch.pieces))
      .filter((id, i, ids) => ids.indexOf(id) === i);
    const nextId = ordered.find(id =>
      !progress.learned.has(id) && ready(id, data.edges, progress.learned)
    ) || ordered.find(id => !progress.learned.has(id));
    const nextPiece = data.byId.get(nextId);
    const button = $('#study-next');
    if (nextPiece && button) {
      const cid = data.courses.find(c =>
        c.chapters.some(ch => ch.pieces.includes(nextId))
      )?.id;
      const track = nextPiece.track === 'math' ? 'math' : 'algorithm';
      button.href = route({ piece: nextId, course: cid, track }, 'lesson.html');
      button.firstChild.textContent = 'Học bài tiếp theo ';
      $('#study-next-caption').textContent = 'Gợi ý tiếp theo: ' + nextPiece.title;
    } else if (button) {
      button.textContent = 'Khám phá thêm kiến thức →';
      button.href = 'index.html';
      $('#study-next-caption').textContent = 'Bạn đã hoàn thành những bài trong lộ trình hiện tại.';
    }
    const completed = data.pieces.filter(p => progress.learned.has(p.id)).length;
    $('#study-count').textContent = String(completed);
    $('#study-total').textContent = '/ ' + data.pieces.length + ' chủ đề';
    $('#study-progress').max = Math.max(1, data.pieces.length);
    $('#study-progress').value = completed;
  } catch {
    $('#study-next-caption').textContent = 'Chọn một môn học để bắt đầu hành trình.';
  }
}

function decorateLesson() {
  const article = $('#lesson-content');
  if (!article || !article.querySelector('#algorithm-animation') || $('#lesson-roadmap')) return;
  const roadmap = document.createElement('nav');
  roadmap.id = 'lesson-roadmap';
  roadmap.className = 'lesson-roadmap';
  roadmap.setAttribute('aria-label', 'Các bước của bài học');
  const steps = [
    { label: 'Đọc hiểu', target: '#lesson-content h1' },
    { label: 'Mô phỏng', target: '#algorithm-animation' },
    { label: 'Luyện code', target: '#coding-lab' },
    { label: 'Tự kiểm tra', target: '.answer-reveal' }
  ].filter(s => s.target !== '#coding-lab' || !$('#coding-lab')?.hidden);
  steps.forEach((step, idx) => {
    const target = document.querySelector(step.target);
    if (!target) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lesson-roadmap-item';
    button.innerHTML = '<strong>' + String(idx + 1).padStart(2, '0') + '</strong><span></span>';
    button.querySelector('span').textContent = step.label;
    button.addEventListener('click', () => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    roadmap.append(button);
  });
  const summary = article.querySelector('.summary');
  (summary || article.querySelector('h1'))?.after(roadmap);
}

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

  // lesson.js fetches Markdown asynchronously. Observe only until it has rendered.
  const observer = new MutationObserver(() => {
    if (content.querySelector('#algorithm-animation')) {
      observer.disconnect();
      // The coding lab is unhidden by mountCodingLab following lesson rendering.
      requestAnimationFrame(() => requestAnimationFrame(decorateLesson));
    }
  });
  observer.observe(content, { childList: true, subtree: true });
  if (content.querySelector('#algorithm-animation')) decorateLesson();
}

if (document.body.classList.contains('lesson-page')) {
  setupLesson();
} else if ($('.workspace-heading')) {
  createDashboard();
  fillDashboard();
  window.addEventListener('hashchange', () => {
    $('#study-dashboard')?.classList.toggle('is-course', location.hash.includes('course='));
    // Existing app.js handles routing. Refresh counts for changed local progress.
    const count = $('#study-count');
    if (count) { try { count.textContent = String(JSON.parse(localStorage.getItem('hus.learned.v1') || '[]').length); } catch {} }
  });
}
