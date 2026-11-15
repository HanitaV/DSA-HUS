import { readRoute, route, prerequisites } from './model.mjs';
import { $, escape, loadData, progress, math, inline, markdown, sourceLinks, badge } from './common.js';
async function start() {
    const data = await loadData();
    const state = readRoute(location.hash);
    const piece = data.byId.get(state.piece);
    if (!piece) {
        $('#lesson-content').innerHTML = '<h1>Không tìm thấy bài học</h1><p>Liên kết chưa có mã mảnh kiến thức hợp lệ.</p><a class="primary" href="index.html">Quay về đồ thị</a>'; return;
    }
    const course = data.courses.find(c => c.id === state.course)?.id;
    const back = route({ piece: piece.id, course }, 'index.html');
    $('#back-graph').href = back;
    document.title = `${piece.title} · Bài học HUS`;
    let content;
    try {
        if (!piece.lesson) throw new Error('Chưa có file bài học riêng.');
        const response = await fetch(piece.lesson);
        if (!response.ok) throw new Error(`Không tải được bài học (${response.status}).`);
        content = markdown(await response.text());
    } catch (error) {
        content = `<p class="notice">${escape(error.message)} Bạn có thể đọc bản tóm tắt và tài liệu nguồn bên dưới.</p>`;
    }
    $('#lesson-content').innerHTML = `<span class="eyebrow">Mảnh kiến thức / ${escape(piece.id)}</span><h1>${escape(piece.title)}</h1><div class="badge-row">${badge(piece)}</div><p class="summary">${inline(piece.summary)}</p>${piece.source ? '<p class="notice">Nội dung này có phần bổ sung ngoài docs, cần được kiểm tra.</p>' : ''}${content}<section class="animation-slot" id="algorithm-animation" data-piece="${escape(piece.id)}" aria-label="Vùng dành cho hoạt ảnh thuật toán"><h2>Thử từng bước</h2><p>Hoạt ảnh tương tác sẽ được bổ sung tại đây. Hiện tại, bạn có thể mô phỏng ví dụ trong bài bằng giấy và bút.</p></section><h2>Nguồn tài liệu</h2>${sourceLinks(piece)}`;
    const link = (id, note) => `<a class="piece-link" href="${route({ piece: id, course }, 'lesson.html')}"><span class="status-dot ${progress.learned.has(id) ? 'done' : ''}"></span><span>${escape(data.byId.get(id).title)}</span><span>↗</span></a>${note ? `<p class="edge-note">${escape(note)}</p>` : ''}`;
    const pre = prerequisites(piece.id, data.edges);
    const applies = data.edges.filter(e => e.source === piece.id && e.relation === 'applies');
    const next = data.edges.filter(e => e.source === piece.id && e.relation === 'prerequisite');
    $('#lesson-context').innerHTML = `<button id="mark-learned" class="secondary" aria-pressed="${progress.learned.has(piece.id)}">${progress.learned.has(piece.id) ? '✓ Đã học · Bỏ đánh dấu' : '○ Đánh dấu đã học'}</button><section class="detail-section"><h2>Cần biết trước</h2>${pre.map(id => link(id)).join('') || '<p class="muted-text">Có thể bắt đầu từ mảnh này.</p>'}</section><section class="detail-section"><h2>Có thể áp dụng trong</h2>${applies.map(e => link(e.target, e.note)).join('') || '<p class="muted-text">Chưa có kết nối áp dụng trong dữ liệu.</p>'}</section><section class="detail-section"><h2>Học tiếp</h2>${next.map(e => link(e.target)).join('') || '<p class="muted-text">Quay lại đồ thị để khám phá hướng khác.</p>'}</section><a class="primary" href="${back}" style="margin-top:24px">← Về vị trí trên đồ thị</a>`;
    $('#mark-learned').onclick = () => {
        progress.toggle(piece.id);
        $('#mark-learned').setAttribute('aria-pressed', String(progress.learned.has(piece.id)));
        $('#mark-learned').textContent = progress.learned.has(piece.id) ? '✓ Đã học · Bỏ đánh dấu' : '○ Đánh dấu đã học';
    };
    progress.announce(); math($('#lesson'));
}
start().catch(error => { $('#lesson-content').innerHTML = `<h1>Không tải được bài học</h1><p>${escape(error.message)}</p><a class="primary" href="index.html">Về đồ thị</a>`; });
window.addEventListener('hashchange', () => location.reload());
