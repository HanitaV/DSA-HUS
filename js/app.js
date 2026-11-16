import { TYPES, TRACKS, normalize, ready, courseIds, recommend, readRoute, route } from './model.mjs';
import { $, escape, loadData, progress, math, inline, pieceLink, badge } from './common.js';
import { KnowledgeGraph } from './graph.js';
import { hasCodingLab, loadSolvedSet, CHALLENGES } from './coding-lab.js';

let data;
let graph;
let selected = null;
let course = null;
let track = 'algorithm';
let visible = [];
let courseKey = null;
let trackKey = null;
let direction = 'LR';
let visibleRelations = new Set(['prerequisite']);

const isEx = piece => Boolean(piece && (piece.type === 'example' || piece.type === 'exercise'));
const pieceTrack = piece => (piece?.track === 'math' ? 'math' : 'algorithm');

function notify(message) {
  $('#app-message').textContent = message;
  $('#app-message').hidden = !message;
}

function navigate(id, cid = course?.id, nextTrack = track) {
  const target = route({ piece: id, course: cid, track: nextTrack }).slice(1);
  location.hash = target;
  if (!target && location.hash === '') applyRoute();
}

function activeRelations() {
  const next = new Set();
  if ($('#rel-prerequisite').checked) next.add('prerequisite');
  if ($('#rel-applies').checked) next.add('applies');
  if ($('#rel-related').checked) next.add('related');
  return next;
}

function filteredPieces(overrideTrack = track) {
  const query = normalize($('#search').value.trim());
  const status = $('#status-filter').value;
  const type = $('#type-filter').value;
  const showExamples = $('#toggle-examples').checked || Boolean(query) || type === 'example' || type === 'exercise';
  const ids = course ? new Set(courseIds(course)) : null;

  return data.pieces.filter(p => {
    if (overrideTrack !== 'all' && pieceTrack(p) !== overrideTrack) return false;
    if (ids && !ids.has(p.id)) return false;
    if (!showExamples && isEx(p) && p.id !== selected) return false;
    if (type !== 'all' && p.type !== type) return false;
    if (query && !normalize(p.title).includes(query)) return false;
    if (status === 'learned') return progress.learned.has(p.id);
    if (status === 'unlearned') return !progress.learned.has(p.id);
    if (status === 'ready') return !progress.learned.has(p.id) && ready(p.id, data.edges, progress.learned);
    return true;
  });
}

function listItem(p) {
  const done = progress.learned.has(p.id);
  const available = ready(p.id, data.edges, progress.learned);
  const tag = track === 'all' ? `<small class="track-mini ${pieceTrack(p)}">${pieceTrack(p) === 'math' ? 'Toán' : 'Code'}</small>` : '';
  return `<a class="list-item ${selected === p.id ? 'selected' : ''}" href="${route({ piece: p.id, course: course?.id, track })}" ${selected === p.id ? 'aria-current="true"' : ''}><span class="status-dot ${done ? 'done' : available ? 'ready' : ''}"></span><span class="list-item-title">${escape(p.title)}</span>${tag}<span class="sr-only">${done ? 'Đã học' : available ? 'Sẵn sàng học' : 'Còn tiên quyết chưa học'}</span></a>`;
}

function renderList() {
  visible = filteredPieces();
  const ids = new Set(visible.map(p => p.id));
  $('#result-count').textContent = `${visible.length} mảnh`;

  if (visible.length) {
    $('#piece-list').innerHTML = course
      ? course.chapters
          .map((ch, i) => {
            const ps = ch.pieces.filter(id => ids.has(id));
            return ps.length
              ? `<h3 class="list-chapter">${i + 1}. ${escape(ch.title)}</h3>${ps.map(id => listItem(data.byId.get(id))).join('')}`
              : '';
          })
          .join('')
      : visible.map(listItem).join('');
  } else {
    const query = $('#search').value.trim();
    const otherTrack = track === 'algorithm' ? 'math' : track === 'math' ? 'algorithm' : null;
    const otherCount = query && otherTrack ? filteredPieces(otherTrack).length : 0;
    $('#piece-list').innerHTML = `<p class="empty-result">Không tìm thấy mảnh phù hợp. Thử từ khóa khác hoặc bỏ bộ lọc.</p>${
      otherCount
        ? `<button id="switch-search-track" class="secondary" type="button">Tìm thấy ${otherCount} mảnh ở ${escape(TRACKS[otherTrack])} →</button>`
        : ''
    }`;
    const switchBtn = $('#switch-search-track');
    if (switchBtn) switchBtn.onclick = () => navigate(null, course?.id, otherTrack);
  }

  const scopePieces = track === 'all' ? data.pieces : data.pieces.filter(p => pieceTrack(p) === track);
  const doneInScope = scopePieces.filter(p => progress.learned.has(p.id)).length;
  $('#total-progress').textContent = `${doneInScope} / ${scopePieces.length} mảnh đã học${track === 'all' ? '' : ` (${TRACKS[track]})`}`;
  $('#global-progress').value = scopePieces.length ? (doneInScope / scopePieces.length) * 100 : 0;
  progress.announce();
}

function renderGraph() {
  graph.render(visible, data.edges, {
    selected,
    learned: progress.learned,
    chapters: course?.chapters,
    direction,
    visibleRelations: [...visibleRelations],
  });
  const layoutLabel = course ? 'theo chương' : direction === 'TB' ? 'từ trên xuống' : 'từ trái sang phải';
  $('#graph-count').textContent = `${visible.length} mảnh · ${track === 'all' ? 'Tất cả' : TRACKS[track]} · ${layoutLabel}`;
}

function relations(id, relation, incoming = false) {
  return data.edges.filter(e => e.relation === relation && (incoming ? e.target : e.source) === id);
}

function detailSection(title, edges, incoming = false, notes = false) {
  return `<section class="detail-section"><h3>${title} <span>${edges.length}</span></h3>${
    edges.length
      ? edges
          .map(e => {
            const target = data.byId.get(incoming ? e.source : e.target);
            return `<a class="piece-link" href="${route({ piece: target.id, course: course?.id, track: pieceTrack(target) })}"><span class="status-dot ${progress.learned.has(target.id) ? 'done' : ''}"></span><span>${escape(target.title)}</span><span aria-hidden="true">↗</span></a>${notes && e.note ? `<p class="edge-note">${escape(e.note)}</p>` : ''}`;
          })
          .join('')
      : '<p class="muted-text">Chưa có kết nối loại này trong dữ liệu.</p>'
  }</section>`;
}

function renderDetail() {
  const p = data.byId.get(selected);
  const detail = $('#detail');
  const shell = $('.app-shell');

  if (!p) {
    detail.hidden = true;
    detail.innerHTML = '';
    shell.classList.remove('has-detail');
    return;
  }

  detail.hidden = false;
  shell.classList.add('has-detail');

  const currentTrack = pieceTrack(p);
  const sameTrackOrNotEx = e => {
    const other = data.byId.get(e.source === p.id ? e.target : e.source);
    if (!other) return false;
    if (currentTrack === 'algorithm' && pieceTrack(other) === 'math') return false;
    return !isEx(p) ? !isEx(other) : true;
  };

  const pre = relations(p.id, 'prerequisite', true).filter(e => currentTrack === 'math' || pieceTrack(data.byId.get(e.source)) !== 'math');
  const applies = relations(p.id, 'applies').filter(sameTrackOrNotEx);
  const next = relations(p.id, 'prerequisite').filter(sameTrackOrNotEx);
  const incoming = relations(p.id, 'applies', true).filter(sameTrackOrNotEx);
  const related = data.edges.filter(
    e => e.relation === 'related' && (e.source === p.id || e.target === p.id) && sameTrackOrNotEx(e)
  );

  const connectedExamples = [];
  const mathBridge = [];
  const seenEx = new Set();
  const seenMath = new Set();
  for (const e of data.edges) {
    const otherId = e.source === p.id ? e.target : e.target === p.id ? e.source : null;
    if (!otherId || otherId === p.id) continue;
    const other = data.byId.get(otherId);
    if (!other) continue;
    if (currentTrack === 'algorithm' && pieceTrack(other) === 'math') {
      if (!seenMath.has(otherId)) {
        seenMath.add(otherId);
        mathBridge.push({ piece: other, edge: e });
      }
      continue;
    }
    if (isEx(other) && !seenEx.has(otherId)) {
      seenEx.add(otherId);
      connectedExamples.push({ piece: other, edge: e });
    }
  }

  const missing = pre.filter(e => !progress.learned.has(e.source));
  const memberships = data.courses.flatMap(c =>
    c.chapters.filter(ch => ch.pieces.includes(p.id)).map(ch => ({ c, ch }))
  );

  detail.innerHTML = `<div class="detail-top"><span class="eyebrow">Mảnh kiến thức</span><div class="detail-top-actions"><button id="share-piece" type="button" aria-label="Sao chép liên kết tới mảnh kiến thức">Chia sẻ ↗</button><button id="close-detail" class="detail-close" type="button" aria-label="Đóng bảng chi tiết">×</button></div></div><div class="badge-row">${badge(p)}${hasCodingLab(p.id) ? `<span class="track-label ${loadSolvedSet().has(p.id) ? 'solved-tag' : 'code-lab-tag'}">${loadSolvedSet().has(p.id) ? 'Đã giải Code ✓' : 'Thực hành Code'}</span>` : ''}</div><h2>${escape(p.title)}</h2><p class="summary">${inline(p.summary)}</p><div class="detail-actions"><a class="primary" href="${route({ piece: p.id, course: course?.id, track: currentTrack }, 'lesson.html')}">${hasCodingLab(p.id) ? 'Mở bài học &amp; Thực hành Code' : 'Mở bài học trực quan'} <span aria-hidden="true">↗</span></a><button class="secondary" type="button" id="mark-learned" aria-pressed="${progress.learned.has(p.id)}">${progress.learned.has(p.id) ? '✓ Đã học · Bỏ đánh dấu' : '○ Đánh dấu đã học'}</button></div><p class="muted-text">${progress.learned.has(p.id) ? 'Bạn đã đánh dấu hoàn thành mảnh này.' : missing.length ? `Còn ${missing.length} mảnh tiên quyết chưa học.` : 'Sẵn sàng học · Đã đủ nền tảng để bắt đầu code.'}</p>${
    connectedExamples.length
      ? `<section class="detail-section"><h3>Ví dụ &amp; bài tập liên quan <span>${connectedExamples.length}</span></h3>${connectedExamples
          .map(
            ({ piece, edge }) =>
              `<a class="piece-link" href="${route({ piece: piece.id, course: course?.id, track: pieceTrack(piece) })}"><span class="status-dot ${progress.learned.has(piece.id) ? 'done' : ''}"></span><span>${escape(piece.title)}</span><small class="ex-tag">${escape(TYPES[piece.type])}</small><span aria-hidden="true">↗</span></a>` +
              (edge.note ? `<p class="edge-note">${escape(edge.note)}</p>` : '')
          )
          .join('')}</section>`
      : ''
  }${detailSection('Có thể áp dụng trong', applies, false, true)}${detailSection('Cần biết trước', pre, true)}${detailSection('Học tiếp từ đây', next)}${incoming.length ? detailSection('Kiến thức được áp dụng', incoming, true, true) : ''}${related.length ? `<section class="detail-section"><h3>Liên quan <span>${related.length}</span></h3>${related.map(e => { const other = data.byId.get(e.source === p.id ? e.target : e.source); return `<a class="piece-link" href="${route({ piece: other.id, course: course?.id, track: pieceTrack(other) })}"><span class="status-dot ${progress.learned.has(other.id) ? 'done' : ''}"></span><span>${escape(other.title)}</span><span aria-hidden="true">↗</span></a>`; }).join('')}</section>` : ''}${
    mathBridge.length
      ? `<section class="detail-section math-bridge"><h3>Lý thuyết toán học liên quan (tách riêng) <span>${mathBridge.length}</span></h3>${mathBridge
          .map(
            ({ piece, edge }) =>
              `<a class="piece-link" href="${route({ piece: piece.id, course: course?.id, track: 'math' })}"><span class="status-dot ${progress.learned.has(piece.id) ? 'done' : ''}"></span><span>${escape(piece.title)}</span><small class="track-mini math">Toán</small><span aria-hidden="true">↗</span></a>` +
              (edge.note ? `<p class="edge-note">${escape(edge.note)}</p>` : '')
          )
          .join('')}</section>`
      : ''
  }<section class="detail-section"><h3>Trong khóa học</h3>${memberships.length ? memberships.map(({ c, ch }) => `<a class="course-position" href="${route({ piece: p.id, course: c.id, track: currentTrack })}">${escape(c.id)} · ${escape(c.name)}<span>${escape(ch.title)} ↗</span></a>`).join('') : '<p class="muted-text">Mảnh này chưa được xếp vào khóa học.</p>'}</section>`;

  $('#close-detail').onclick = () => navigate(null);
  $('#mark-learned').onclick = () => {
    progress.toggle(p.id);
    renderList();
    renderCourse();
    renderDetail();
    graph.update(selected, progress.learned, data.edges, [...visibleRelations]);
    $('#mark-learned')?.focus();
  };
  $('#share-piece').onclick = async () => {
    const url = new URL(route({ piece: p.id, course: course?.id, track: currentTrack }, 'index.html'), location.href).href;
    try {
      await navigator.clipboard.writeText(url);
      $('#share-piece').textContent = 'Đã sao chép ✓';
    } catch {
      notify(`Liên kết chia sẻ: ${url}`);
    }
  };
  math(detail);
}

function renderExploreGuide() {
  const host = $('#explore-guide');
  if (!host) return;
  if (course || track === 'math') {
    host.hidden = true;
    return;
  }
  const scope = data.pieces.filter(p => track === 'all' || pieceTrack(p) === track);
  const readyPieces = scope.filter(p => !progress.learned.has(p.id) && ready(p.id, data.edges, progress.learned));
  const nextCoding = readyPieces.find(p => hasCodingLab(p.id)) || readyPieces[0];
  const totalLabs = Object.keys(CHALLENGES).length;
  const solvedCount = loadSolvedSet().size;

  host.hidden = false;
  host.innerHTML = `
    <div class="explore-guide-info">
      <span class="guide-pill"><strong>${readyPieces.length}</strong> mảnh sẵn sàng học</span>
      <span class="guide-pill"><strong>${solvedCount}/${totalLabs}</strong> bài thực hành Code đã giải</span>
    </div>
    ${nextCoding ? `<a class="guide-next-btn" href="${route({ piece: nextCoding.id, track: pieceTrack(nextCoding) }, 'lesson.html')}">Bắt đầu thực hành: ${escape(nextCoding.title)} →</a>` : ''}
  `;
}

function renderCourse() {
  $('#course-overview').hidden = !course;
  $('#course-path').hidden = !course;
  if (!course) return;
  const ids = courseIds(course);
  const algIds = ids.filter(id => pieceTrack(data.byId.get(id)) === 'algorithm');
  const mathIds = ids.filter(id => pieceTrack(data.byId.get(id)) === 'math');
  const algDone = algIds.filter(id => progress.learned.has(id)).length;
  const mathDone = mathIds.filter(id => progress.learned.has(id)).length;
  const activeIds = track === 'math' ? mathIds : track === 'all' ? ids : algIds;
  const activeDone = activeIds.filter(id => progress.learned.has(id)).length;
  const recommendTrack = track === 'all' ? 'algorithm' : track;
  const nextId = recommend(course, data.edges, progress.learned, recommendTrack, data.byId) || recommend(course, data.edges, progress.learned);

  $('#course-overview').innerHTML = `<h3>${escape(course.name)}</h3><p>${escape(course.aim)}</p><details><summary>Chuẩn đầu ra của khóa học</summary><ul>${course.outcomes.map(o => `<li>${escape(o)}</li>`).join('')}</ul></details><div class="course-track-stats"><span><strong>Thuật toán &amp; Code (Ưu tiên):</strong> ${algDone} / ${algIds.length}</span><span><strong>Lý thuyết Toán (Tách riêng):</strong> ${mathDone} / ${mathIds.length}</span></div><div class="course-progress"><span>Đang xem: ${track === 'all' ? 'Tất cả' : TRACKS[track]} (${activeDone} / ${activeIds.length} mảnh đã học)</span><strong>${activeIds.length ? Math.round((activeDone / activeIds.length) * 100) : 0}%</strong></div><progress max="${Math.max(1, activeIds.length)}" value="${activeDone}" aria-label="Tiến độ khóa học"></progress>${nextId ? `<p>Mảnh nên học tiếp (${pieceTrack(data.byId.get(nextId)) === 'math' ? 'Lý thuyết Toán' : 'Ưu tiên Code'})</p><a class="primary" href="${route({ piece: nextId, course: course.id, track: pieceTrack(data.byId.get(nextId)) })}">${escape(data.byId.get(nextId).title)} →</a>` : `<p>${activeDone === activeIds.length ? 'Bạn đã hoàn thành toàn bộ mảnh trong nhánh này.' : 'Các mảnh còn lại cần tiên quyết ngoài khóa. Chọn mảnh để học tiên quyết trong chế độ Khám phá.'}</p>`}`;

  const renderChapterBlock = (targetTrack, title) => {
    const blocks = course.chapters
      .map((ch, i) => {
        const ps = ch.pieces.filter(id => pieceTrack(data.byId.get(id)) === targetTrack);
        if (!ps.length) return '';
        return `<section class="chapter"><h3 id="chapter-${escape(ch.id)}-${targetTrack}"><span class="chapter-meta">${String(i + 1).padStart(2, '0')}</span>${escape(ch.title)}</h3><div class="chapter-pieces">${ps
          .map(id => {
            const piece = data.byId.get(id);
            const tag = !progress.learned.has(id) && ready(id, data.edges, progress.learned)
              ? '<small class="ready-label">Sẵn sàng</small>'
              : '';
            return `<a class="piece-link" href="${route({ piece: piece.id, course: course.id, track: targetTrack })}"><span class="status-dot ${progress.learned.has(piece.id) ? 'done' : ''}"></span><span>${escape(piece.title)}</span>${tag}<span aria-hidden="true">↗</span></a>`;
          })
          .join('')}</div></section>`;
      })
      .join('');
    return blocks ? `<div class="course-track-section"><h2 class="course-track-heading">${title}</h2>${blocks}</div>` : '';
  };

  if (track === 'all') {
    $('#course-path').innerHTML = renderChapterBlock('algorithm', 'Phần 1 · Thuật toán &amp; Code (Ưu tiên học để cài đặt)') +
      renderChapterBlock('math', 'Phần 2 · Lý thuyết Toán học &amp; Chứng minh (Tách riêng)');
  } else {
    const title = track === 'algorithm' ? 'Lộ trình Thuật toán &amp; Code theo chương' : 'Lộ trình Lý thuyết Toán học theo chương (Tách riêng)';
    $('#course-path').innerHTML = renderChapterBlock(track, title);
  }
}

function updateTrackUI() {
  const scopePieces = course ? courseIds(course).map(id => data.byId.get(id)).filter(Boolean) : data.pieces;
  const algCount = scopePieces.filter(p => pieceTrack(p) === 'algorithm').length;
  const mathCount = scopePieces.filter(p => pieceTrack(p) === 'math').length;

  $('#track-algorithm').textContent = `Thuật toán & Code (${algCount})`;
  $('#track-math').textContent = `Lý thuyết Toán học (${mathCount})`;
  $('#track-all').textContent = `Tất cả (${scopePieces.length})`;

  for (const [id, key] of [['#track-algorithm', 'algorithm'], ['#track-math', 'math'], ['#track-all', 'all']]) {
    const active = track === key;
    $(id).classList.toggle('active', active);
    $(id).setAttribute('aria-pressed', String(active));
  }

  const hints = {
    algorithm: 'Ưu tiên cấu trúc dữ liệu, mô phỏng trực quan và tư duy viết code.',
    math: 'Tách riêng định nghĩa toán học, chứng minh quy nạp, công thức truy hồi và máy Turing.',
    all: 'Hiển thị kết hợp cả hai nhánh (thẻ Lý thuyết Toán được gắn nhãn riêng).',
  };
  $('#track-hint').textContent = hints[track];
}

function applyRoute() {
  const state = readRoute(location.hash);
  const newCourse = data.courses.find(c => c.id === state.course) || null;
  const courseChanged = courseKey !== newCourse?.id;
  course = newCourse;
  courseKey = course?.id;
  selected = data.byId.has(state.piece) ? state.piece : null;
  const selectedPiece = data.byId.get(selected);
  let nextTrack = state.track || 'algorithm';
  if (selectedPiece && nextTrack !== 'all' && pieceTrack(selectedPiece) !== nextTrack) {
    nextTrack = pieceTrack(selectedPiece);
  }
  const trackChanged = trackKey !== nextTrack;
  track = nextTrack;
  trackKey = track;

  notify(
    state.piece && !selected
      ? 'Không tìm thấy mảnh trong liên kết. Hãy tìm một mảnh ở danh sách.'
      : state.course && !course
        ? 'Không tìm thấy khóa học. Đang hiển thị tất cả kiến thức.'
        : ''
  );

  // A node outside a course remains reachable, and is explicitly shown in exploration.
  if (course && selected && !courseIds(course).includes(selected)) {
    navigate(selected, null, track);
    return;
  }

  if (selectedPiece) {
    const query = normalize($('#search').value);
    if ((query && !normalize(selectedPiece.title).includes(query)) || $('#status-filter').value !== 'all' || ($('#type-filter').value !== 'all' && $('#type-filter').value !== selectedPiece.type)) {
      $('#search').value = '';
      $('#status-filter').value = 'all';
      $('#type-filter').value = 'all';
    }
  }

  updateTrackUI();

  $('#course-select').value = course?.id || '';
  $('#explore-link').classList.toggle('active', !course);
  $('#course-mode').classList.toggle('active', Boolean(course));
  $('#explore-link').setAttribute('aria-current', !course ? 'page' : 'false');
  const trackSuffix = track === 'all' ? 'Tất cả' : TRACKS[track];
  $('#mode-label').textContent = course ? `Theo khóa học · ${course.id} · ${trackSuffix}` : `Chế độ khám phá · ${trackSuffix}`;
  $('#workspace-title').textContent = track === 'math'
    ? 'Lý thuyết toán học và chứng minh (tách riêng).'
    : course
      ? 'Lộ trình học để code từng bước.'
      : 'Học thuật toán trực quan để dễ viết code.';
  $('#workspace-description').textContent = track === 'math'
    ? 'Phần chứng minh, đánh giá độ phức tạp và máy Turing được tách khỏi luồng học code chính.'
    : 'Lý thuyết toán học đã được tách riêng. Kéo để di chuyển, Ctrl + cuộn để thu phóng, chọn thẻ để xem bài học trực quan.';
  document.title = `${selected ? `${data.byId.get(selected).title} · ` : ''}${course?.id || 'Bản đồ kiến thức'} · HUS`;

  const previousIds = visible.map(p => p.id).join(',');
  renderList();
  renderExploreGuide();
  renderCourse();
  renderDetail();

  if (courseChanged || trackChanged || previousIds !== visible.map(p => p.id).join(',') || !graph.rendered) {
    renderGraph();
  } else {
    graph.update(selected, progress.learned, data.edges, [...visibleRelations]);
  }

  if (selected) {
    graph.center(selected);
    if (course) {
      const chapter = course.chapters.find(ch => ch.pieces.includes(selected));
      $('#course-path')
        .querySelectorAll('.chapter')
        .forEach(el => el.classList.toggle('current-chapter', Boolean(chapter && el.querySelector('h3').id.startsWith(`chapter-${chapter.id}-`))));
    }
  }
}

async function start() {
  data = await loadData();
  graph = new KnowledgeGraph($('#graph'), id => navigate(id), { minimap: $('#minimap') });

  $('#course-select').insertAdjacentHTML(
    'beforeend',
    data.courses.map(c => `<option value="${escape(c.id)}">${escape(c.id)} · ${escape(c.name)}</option>`).join('')
  );

  const resetFilters = () => {
    $('#search').value = '';
    $('#status-filter').value = 'all';
    $('#type-filter').value = 'all';
  };

  $('#course-select').onchange = () => {
    resetFilters();
    navigate(null, $('#course-select').value, track);
  };
  $('#course-mode').onclick = () => {
    resetFilters();
    navigate(null, course?.id || data.courses[0].id, track);
  };
  $('#explore-link').onclick = event => {
    event.preventDefault();
    resetFilters();
    navigate(null, null, track);
  };

  for (const [sel, nextTrack] of [['#track-algorithm', 'algorithm'], ['#track-math', 'math'], ['#track-all', 'all']]) {
    $(sel).onclick = () => {
      resetFilters();
      navigate(null, course?.id, nextTrack);
    };
  }

  for (const selector of ['#search', '#status-filter']) {
    $(selector).addEventListener(selector === '#search' ? 'input' : 'change', () => {
      renderList();
      renderGraph();
    });
  }

  $('#type-filter').onchange = () => {
    const val = $('#type-filter').value;
    if (val === 'example' || val === 'exercise') $('#toggle-examples').checked = true;
    renderList();
    renderGraph();
  };

  $('#toggle-examples').onchange = () => {
    renderList();
    renderGraph();
  };

  $('#layout-dir').onchange = () => {
    direction = $('#layout-dir').value;
    renderGraph();
    if (selected) graph.center(selected);
  };

  for (const selector of ['#rel-prerequisite', '#rel-applies', '#rel-related']) {
    $(selector).onchange = () => {
      visibleRelations = activeRelations();
      graph.update(selected, progress.learned, data.edges, [...visibleRelations]);
    };
  }

  $('#filter-toggle').onclick = () => {
    const opening = $('#filter-bar').hidden;
    $('#filter-bar').hidden = !opening;
    $('#filter-toggle').setAttribute('aria-expanded', String(opening));
    $('#filter-toggle').classList.toggle('active', opening);
  };

  const setDesktopSidebarCollapsed = collapsed => {
    $('.app-shell').classList.toggle('sidebar-collapsed', collapsed);
    $('#collapse-sidebar').setAttribute('aria-expanded', String(!collapsed));
    $('#reopen-sidebar').hidden = !collapsed;
    $('#reopen-sidebar').setAttribute('aria-expanded', String(!collapsed));
  };
  $('#collapse-sidebar').onclick = () => {
    setDesktopSidebarCollapsed(true);
    $('#reopen-sidebar').focus();
  };
  $('#reopen-sidebar').onclick = () => {
    setDesktopSidebarCollapsed(false);
    $('#search').focus();
  };

  $('#zoom-in').onclick = () => graph.zoom(1.35);
  $('#zoom-out').onclick = () => graph.zoom(1 / 1.35);
  $('#fit-graph').onclick = () => graph.fit();

  $('#sidebar-toggle').onclick = () => {
    const open = $('#sidebar').classList.toggle('open');
    $('#sidebar-toggle').setAttribute('aria-expanded', String(open));
    if (open) $('#search').focus();
  };

  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      if ($('.app-shell').classList.contains('sidebar-collapsed')) setDesktopSidebarCollapsed(false);
      $('#sidebar').classList.add('open');
      $('#sidebar-toggle').setAttribute('aria-expanded', 'true');
      $('#search').focus();
    }
    if (event.key === 'Escape') {
      if ($('#sidebar').classList.contains('open')) {
        $('#sidebar').classList.remove('open');
        $('#sidebar-toggle').setAttribute('aria-expanded', 'false');
        $('#sidebar-toggle').focus();
      } else if (selected) {
        navigate(null);
      } else if (!$('#filter-bar').hidden) {
        $('#filter-bar').hidden = true;
        $('#filter-toggle').setAttribute('aria-expanded', 'false');
        $('#filter-toggle').classList.remove('active');
        $('#filter-toggle').focus();
      }
    }
  });

  window.addEventListener('hashchange', applyRoute);
  window.addEventListener('storage', event => {
    if (event.key === 'hus.learned.v1') location.reload();
  });

  applyRoute();
  $('.workspace-heading').classList.add('entrance');
}

start().catch(error => {
  notify(`${error.message}. Thử tải lại trang; khi chạy local hãy dùng npm run serve.`);
  $('#piece-list').innerHTML = '<p>Không tải được dữ liệu.</p>';
});
