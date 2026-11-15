import { TYPES, normalize, prerequisites, ready, courseIds, recommend, readRoute, route } from './model.mjs';
import { $, escape, loadData, progress, math, inline, sourceLinks, pieceLink, badge } from './common.js';
import { KnowledgeGraph } from './graph.js';

let data, graph, selected = null, course = null, visible = [], courseKey = null;
function notify(message) { $('#app-message').textContent = message; $('#app-message').hidden = !message; }
function navigate(id, cid = course?.id) { location.hash = route({ piece: id, course: cid }).slice(1); }
function filteredPieces() {
    const query = normalize($('#search').value.trim());
    const status = $('#status-filter').value;
    const ids = course ? new Set(courseIds(course)) : null;
    return data.pieces.filter(p => (!ids || ids.has(p.id)) && normalize(p.title).includes(query) &&
        (status === 'all' || status === 'learned' && progress.learned.has(p.id) || status === 'unlearned' && !progress.learned.has(p.id) || status === 'ready' && !progress.learned.has(p.id) && ready(p.id, data.edges, progress.learned)));
}
function listItem(p) {
    const done = progress.learned.has(p.id), available = ready(p.id, data.edges, progress.learned);
    return `<a class="list-item ${selected === p.id ? 'selected' : ''}" href="${route({ piece: p.id, course: course?.id })}" ${selected === p.id ? 'aria-current="true"' : ''}><span class="status-dot ${done ? 'done' : available ? 'ready' : ''}"></span><span>${escape(p.title)}</span><span class="sr-only">${done ? 'Đã học' : available ? 'Sẵn sàng học' : 'Còn tiên quyết chưa học'}</span></a>`;
}
function renderList() {
    visible = filteredPieces();
    const ids = new Set(visible.map(p => p.id));
    $('#result-count').textContent = `${visible.length} mảnh`;
    $('#piece-list').innerHTML = visible.length ? course ? course.chapters.map((ch, i) => {
        const ps = ch.pieces.filter(id => ids.has(id));
        return ps.length ? `<h3 class="list-chapter">${i + 1}. ${escape(ch.title)}</h3>${ps.map(id => listItem(data.byId.get(id))).join('')}` : '';
    }).join('') : visible.map(listItem).join('') : '<p class="empty-result">Không tìm thấy mảnh phù hợp. Thử từ khóa khác hoặc bỏ bộ lọc.</p>';
    const total = data.pieces.filter(p => progress.learned.has(p.id)).length;
    $('#total-progress').textContent = `${total} / ${data.pieces.length} mảnh đã học`;
    $('#global-progress').value = total / data.pieces.length * 100;
    progress.announce();
}
function renderGraph() {
    graph.render(visible, data.edges, { selected, learned: progress.learned, chapters: course?.chapters });
    if (course && !selected && visible.length) graph.center(visible[0].id);
    $('#graph-count').textContent = `${visible.length} mảnh kiến thức${course ? ' · theo chương' : ' · tự do khám phá'}`;
}
function relations(id, relation, incoming = false) {
    return data.edges.filter(e => e.relation === relation && (incoming ? e.target : e.source) === id);
}
function detailSection(title, edges, incoming = false, notes = false) {
    return `<section class="detail-section"><h3>${title} <span>${edges.length}</span></h3>${edges.length ? edges.map(e => pieceLink(data.byId.get(incoming ? e.source : e.target), course?.id) + (notes && e.note ? `<p class="edge-note">${escape(e.note)}</p>` : '')).join('') : '<p class="muted-text">Chưa có kết nối loại này trong dữ liệu.</p>'}</section>`;
}
function renderDetail() {
    const p = data.byId.get(selected);
    if (!p) { $('#detail').innerHTML = '<div class="detail-empty"><span class="eyebrow">Một điểm bắt đầu</span><h2>Bạn muốn hiểu điều gì?</h2><p>Chọn trên đồ thị hoặc tìm một mảnh trong danh sách bên trái.</p></div>'; return; }
    const pre = relations(p.id, 'prerequisite', true), applies = relations(p.id, 'applies'), next = relations(p.id, 'prerequisite');
    const incoming = relations(p.id, 'applies', true);
    const related = data.edges.filter(e => e.relation === 'related' && (e.source === p.id || e.target === p.id));
    const missing = pre.filter(e => !progress.learned.has(e.source));
    const memberships = data.courses.flatMap(c => c.chapters.filter(ch => ch.pieces.includes(p.id)).map(ch => ({ c, ch })));
    $('#detail').innerHTML = `<div class="detail-top"><span class="eyebrow">Mảnh kiến thức</span><button id="share-piece" aria-label="Sao chép liên kết tới mảnh kiến thức">Chia sẻ ↗</button></div><div class="badge-row">${badge(p)}</div><h2>${escape(p.title)}</h2><p class="summary">${inline(p.summary)}</p>${p.source ? '<p class="notice">Có nội dung bổ sung ngoài docs, cần kiểm tra nguồn.</p>' : ''}<div class="detail-actions"><a class="primary" href="${route({ piece: p.id, course: course?.id }, 'lesson.html')}">Mở bài học <span aria-hidden="true">↗</span></a><button class="secondary" id="mark-learned" aria-pressed="${progress.learned.has(p.id)}">${progress.learned.has(p.id) ? '✓ Đã học · Bỏ đánh dấu' : '○ Đánh dấu đã học'}</button></div><p class="muted-text">${progress.learned.has(p.id) ? 'Bạn đã đánh dấu hoàn thành mảnh này.' : missing.length ? `Còn ${missing.length} mảnh tiên quyết chưa học.` : 'Sẵn sàng học · Bạn đã học đủ tiên quyết.'}</p>${detailSection('Có thể áp dụng trong', applies, false, true)}${detailSection('Cần biết trước', pre, true)}${detailSection('Học tiếp từ đây', next)}${incoming.length ? detailSection('Kiến thức được áp dụng', incoming, true, true) : ''}${related.length ? `<section class="detail-section"><h3>Liên quan</h3>${related.map(e => pieceLink(data.byId.get(e.source === p.id ? e.target : e.source), course?.id)).join('')}</section>` : ''}<section class="detail-section"><h3>Trong khóa học</h3>${memberships.length ? memberships.map(({ c, ch }) => `<a class="course-position" href="${route({ piece: p.id, course: c.id })}">${escape(c.id)} · ${escape(c.name)}<span>${escape(ch.title)} ↗</span></a>`).join('') : '<p class="muted-text">Mảnh này chưa được xếp vào khóa học.</p>'}</section><section class="detail-section"><h3>Nguồn tài liệu</h3>${sourceLinks(p)}</section>`;
    $('#mark-learned').onclick = () => {
        progress.toggle(p.id); renderList(); renderCourse(); renderDetail(); graph.update(selected, progress.learned, data.edges); $('#mark-learned').focus();
    };
    $('#share-piece').onclick = async () => {
        const url = new URL(route({ piece: p.id, course: course?.id }, 'index.html'), location.href).href;
        try { await navigator.clipboard.writeText(url); $('#share-piece').textContent = 'Đã sao chép ✓'; }
        catch { notify(`Liên kết chia sẻ: ${url}`); }
    };
    math($('#detail'));
}
function renderCourse() {
    $('#course-overview').hidden = !course;
    $('#course-path').hidden = !course;
    if (!course) return;
    const ids = courseIds(course), completed = ids.filter(id => progress.learned.has(id)).length;
    const nextId = recommend(course, data.edges, progress.learned);
    $('#course-overview').innerHTML = `<h3>${escape(course.name)}</h3><p>${escape(course.aim)}</p><details><summary>Chuẩn đầu ra của khóa học</summary><ul>${course.outcomes.map(o => `<li>${escape(o)}</li>`).join('')}</ul></details><div class="course-progress"><span>${completed} / ${ids.length} mảnh đã học</span><strong>${Math.round(completed / ids.length * 100)}%</strong></div><progress max="${ids.length}" value="${completed}" aria-label="Tiến độ khóa học"></progress>${nextId ? `<p>Mảnh nên học tiếp</p><a class="primary" href="${route({ piece: nextId, course: course.id })}">${escape(data.byId.get(nextId).title)} →</a>` : `<p>${completed === ids.length ? 'Bạn đã học hết các mảnh trong khóa học.' : 'Các mảnh còn lại cần tiên quyết ngoài khóa. Chọn mảnh để xem và học tiên quyết trong chế độ Khám phá.'}</p>`}`;
    $('#course-path').innerHTML = `<h2>Lộ trình theo chương</h2>${course.chapters.map((ch, i) => `<section class="chapter"><h3 id="chapter-${escape(ch.id)}"><span class="chapter-meta">${String(i + 1).padStart(2, '0')}</span>${escape(ch.title)}</h3><div class="chapter-pieces">${ch.pieces.map(id => pieceLink(data.byId.get(id), course.id, !progress.learned.has(id) && ready(id, data.edges, progress.learned) ? '<small class="ready-label">Sẵn sàng</small>' : '')).join('')}</div></section>`).join('')}`;
}
function applyRoute() {
    const state = readRoute(location.hash);
    const newCourse = data.courses.find(c => c.id === state.course) || null;
    const courseChanged = courseKey !== newCourse?.id;
    course = newCourse;
    courseKey = course?.id;
    selected = data.byId.has(state.piece) ? state.piece : null;
    notify(state.piece && !selected ? 'Không tìm thấy mảnh trong liên kết. Hãy tìm một mảnh ở danh sách.' : state.course && !course ? 'Không tìm thấy khóa học. Đang hiển thị tất cả kiến thức.' : '');
    // A node outside a course remains reachable, and is explicitly shown in exploration.
    if (course && selected && !courseIds(course).includes(selected)) {
        navigate(selected, null); return;
    }
    if (selected && (normalize($('#search').value) && !normalize(data.byId.get(selected).title).includes(normalize($('#search').value)) || $('#status-filter').value !== 'all')) {
        $('#search').value = ''; $('#status-filter').value = 'all';
    }
    $('#course-select').value = course?.id || '';
    $('#explore-link').classList.toggle('active', !course);
    $('#course-mode').classList.toggle('active', !!course);
    $('#explore-link').setAttribute('aria-current', !course ? 'page' : 'false');
    $('#mode-label').textContent = course ? `Theo khóa học · ${course.id}` : 'Chế độ khám phá';
    $('#workspace-title').textContent = course ? 'Một lộ trình, từng bước hiểu sâu.' : 'Mỗi kết nối mở một hướng học.';
    $('#workspace-description').textContent = course ? 'Đi theo chương, học đủ tiên quyết và tiếp tục từ nơi bạn đã dừng.' : 'Chọn một mảnh để xem cần biết gì và có thể dùng ở đâu.';
    document.title = `${selected ? data.byId.get(selected).title + ' · ' : ''}${course?.id || 'Bản đồ kiến thức'} · HUS`;
    const previousIds = visible.map(p => p.id).join(',');
    renderList(); renderCourse(); renderDetail();
    if (courseChanged || previousIds !== visible.map(p => p.id).join(',') || !graph.points) renderGraph();
    else graph.update(selected, progress.learned, data.edges);
    if (selected) {
        graph.center(selected);
        if (course) {
            const chapter = course.chapters.find(ch => ch.pieces.includes(selected));
            $('#course-path').querySelectorAll('.chapter').forEach(el => el.classList.toggle('current-chapter', el.querySelector('h3').id === `chapter-${chapter.id}`));
        }
    }
}
async function start() {
    data = await loadData();
    graph = new KnowledgeGraph($('#graph'), id => navigate(id));
    $('#course-select').insertAdjacentHTML('beforeend', data.courses.map(c => `<option value="${escape(c.id)}">${escape(c.id)} · ${escape(c.name)}</option>`).join(''));
    $('#course-select').onchange = () => { $('#search').value = ''; $('#status-filter').value = 'all'; navigate(null, $('#course-select').value); };
    $('#course-mode').onclick = () => { $('#search').value = ''; $('#status-filter').value = 'all'; navigate(null, course?.id || data.courses[0].id); };
    $('#explore-link').onclick = event => { event.preventDefault(); $('#search').value = ''; $('#status-filter').value = 'all'; navigate(null, null); };
    for (const selector of ['#search', '#status-filter']) $(selector).addEventListener(selector === '#search' ? 'input' : 'change', () => { renderList(); renderGraph(); });
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
            event.preventDefault(); $('#sidebar').classList.add('open'); $('#sidebar-toggle').setAttribute('aria-expanded', 'true'); $('#search').focus();
        }
        if (event.key === 'Escape') { $('#sidebar').classList.remove('open'); $('#sidebar-toggle').setAttribute('aria-expanded', 'false'); $('#sidebar-toggle').focus(); }
    });
    window.addEventListener('hashchange', applyRoute);
    window.addEventListener('storage', event => { if (event.key === 'hus.learned.v1') location.reload(); });
    if (!location.hash || location.hash === '#') {
        const entry = [...data.pieces].filter(p => p.difficulty === 1).sort((a, b) => data.edges.filter(e => e.source === b.id && e.relation === 'applies').length - data.edges.filter(e => e.source === a.id && e.relation === 'applies').length)[0] || data.pieces[0];
        if (entry) history.replaceState(null, '', route({ piece: entry.id }));
    }
    applyRoute();
    $('.workspace-heading').classList.add('entrance');
}
start().catch(error => { notify(`${error.message}. Thử tải lại trang; khi chạy local hãy dùng npm run serve.`); $('#piece-list').innerHTML = '<p>Không tải được dữ liệu.</p>'; });
