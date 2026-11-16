import { readRoute, route, prerequisites } from './model.mjs';
import { $, escape, loadData, progress, math, inline, markdown, badge, setPieceIndex } from './common.js';
import { mountVisualizer } from './visualizers/index.js';
import { mountCodingLab, hasCodingLab } from './coding-lab.js';

function slugifyHeading(text, idx) {
    return `sec-${idx}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || idx}`;
}

function isMathHeavyHeading(headingNorm) {
    return headingNorm.includes('độ phức tạp') || headingNorm.includes('chứng minh');
}

function splitLessonMarkdown(raw) {
    const lines = raw.split(/\r?\n/);
    const sections = [];
    let current = { heading: '', body: [] };
    for (const line of lines) {
        if (/^##\s+/.test(line)) {
            if (current.heading || current.body.length) sections.push(current);
            current = { heading: line.replace(/^##\s+/, '').trim(), body: [] };
        } else {
            current.body.push(line);
        }
    }
    if (current.heading || current.body.length) sections.push(current);
    return sections;
}

function renderSections(sections, track) {
    let introHtml = '';
    let restHtml = '';
    const navItems = [];
    const preferCode = track !== 'math';

    sections.forEach((sec, index) => {
        const bodyMd = sec.body.join('\n').trim();
        const headingNorm = sec.heading.toLowerCase();
        if (headingNorm.includes('gợi ý đối chiếu')) {
            const inner = markdown(bodyMd);
            restHtml += `<details class="answer-reveal"><summary>Xem gợi ý đáp án &amp; giải thích</summary><div class="answer-body">${inner}</div></details>`;
            return;
        }
        const id = sec.heading ? slugifyHeading(sec.heading, index) : '';
        if (sec.heading && index > 0) {
            navItems.push({ id, label: sec.heading });
        }
        const headingHtml = sec.heading ? `<h2 id="${id}">${inline(sec.heading)}</h2>` : '';
        const bodyHtml = markdown(bodyMd);

        if (index === 0) {
            introHtml += `${headingHtml}${bodyHtml}`;
        } else if (preferCode && isMathHeavyHeading(headingNorm)) {
            restHtml += `<details class="math-fold" id="${id}-fold"><summary>📐 ${inline(sec.heading)} <span class="math-fold-tag">Lý thuyết Toán · Bấm để mở</span></summary><div class="math-fold-body">${headingHtml}${bodyHtml}</div></details>`;
        } else {
            restHtml += `${headingHtml}${bodyHtml}`;
        }
    });
    return { introHtml, restHtml, navItems };
}

async function start() {
    const data = await loadData();
    const state = readRoute(location.hash);
    const piece = data.byId.get(state.piece);
    if (!piece) {
        $('#lesson-content').innerHTML = '<h1>Không tìm thấy bài học</h1><p>Liên kết chưa có mã mảnh kiến thức hợp lệ.</p><a class="primary" href="index.html">Quay về đồ thị</a>';
        return;
    }
    const course = data.courses.find(c => c.id === state.course)?.id;
    setPieceIndex(data.byId, course);
    const track = piece.track === 'math' ? 'math' : 'algorithm';
    const back = route({ piece: piece.id, course, track }, 'index.html');
    $('#back-graph').href = back;
    const footerLink = $('#footer-map-link');
    if (footerLink) footerLink.href = route({ course, track }, 'index.html');
    document.title = `${piece.title} · Bài học HUS`;

    let introHtml = '';
    let restHtml = '';
    let navItems = [];
    try {
        if (!piece.lesson) throw new Error('Chưa có bài học chi tiết.');
        const response = await fetch(piece.lesson);
        if (!response.ok) throw new Error(`Không tải được bài học (${response.status}).`);
        const raw = await response.text();
        const sections = splitLessonMarkdown(raw);
        if (sections.length) {
            ({ introHtml, restHtml, navItems } = renderSections(sections, track));
        } else {
            introHtml = markdown(raw);
        }
    } catch (error) {
        introHtml = `<p class="notice">${escape(error.message)} Bạn có thể theo dõi phần trực quan tương tác bên dưới.</p>`;
    }

    const codingAvailable = hasCodingLab(piece.id);
    const jumpPills = [
        { id: 'algorithm-animation', label: 'Mô phỏng' },
        ...(codingAvailable ? [{ id: 'coding-lab', label: 'Thực hành Code' }] : track !== 'math' ? [{ id: 'coding-lab', label: 'Python Playground' }] : []),
        ...navItems.slice(0, 5)
    ];

    const trackNote = track === 'math'
        ? '<p class="track-banner math"><strong>Nhánh Lý thuyết Toán học (Tách riêng):</strong> Tập trung phân tích độ phức tạp, chứng minh và mô hình toán học.</p>'
        : `<div class="lesson-smart-bar">
            <div class="lesson-jump-pills" aria-label="Đi nhanh tới mục">${jumpPills.map(item => `<button type="button" class="jump-pill" data-target="${escape(item.id)}">${escape(item.label)}</button>`).join('')}</div>
            <div class="lesson-focus-toggle" role="group" aria-label="Chế độ hiển thị bài học">
                <button type="button" id="mode-code-first" class="focus-btn active" aria-pressed="true">Ưu tiên Code</button>
                <button type="button" id="mode-full-theory" class="focus-btn" aria-pressed="false">Đầy đủ cả Toán</button>
            </div>
        </div>`;

    $('#lesson-content').innerHTML = `
        <span class="eyebrow">Bài học trực quan / ${escape(piece.id)}</span>
        <h1>${escape(piece.title)}</h1>
        <div class="badge-row">${badge(piece)}${codingAvailable ? '<span class="track-label code-lab-tag">Có bài thực hành Code</span>' : ''}</div>
        <p class="summary">${inline(piece.summary)}</p>
        ${trackNote}
        ${introHtml}
        <section class="animation-slot viz-card" id="algorithm-animation" data-piece="${escape(piece.id)}" aria-label="Mô phỏng trực quan tương tác">
            <div class="viz-loading">Đang khởi tạo mô phỏng trực quan…</div>
        </section>
        <section class="coding-slot viz-card" id="coding-lab" hidden aria-label="Thực hành viết và kiểm thử code"></section>
        ${restHtml}
    `;

    document.querySelectorAll('.jump-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetEl = document.getElementById(targetId) || document.getElementById(`${targetId}-fold`);
            if (!targetEl) return;
            if (targetEl.tagName === 'DETAILS') targetEl.open = true;
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const btnCodeFirst = $('#mode-code-first');
    const btnFullTheory = $('#mode-full-theory');
    if (btnCodeFirst && btnFullTheory) {
        const setFoldState = expandMath => {
            document.querySelectorAll('.math-fold').forEach(d => { d.open = expandMath; });
            btnCodeFirst.classList.toggle('active', !expandMath);
            btnCodeFirst.setAttribute('aria-pressed', String(!expandMath));
            btnFullTheory.classList.toggle('active', expandMath);
            btnFullTheory.setAttribute('aria-pressed', String(expandMath));
        };
        btnCodeFirst.addEventListener('click', () => setFoldState(false));
        btnFullTheory.addEventListener('click', () => setFoldState(true));
    }

    document.querySelectorAll('.copy-code-btn').forEach(btn => {
        btn.onclick = async () => {
            const codeEl = btn.closest('.code-block')?.querySelector('pre code');
            if (!codeEl) return;
            try {
                await navigator.clipboard.writeText(codeEl.textContent || '');
                btn.textContent = 'Đã sao chép ✓';
                setTimeout(() => { btn.textContent = 'Sao chép'; }, 1600);
            } catch {
                btn.textContent = 'Chọn để chép';
            }
        };
    });

    const link = (id, note, badgeText = '') => {
        const target = data.byId.get(id);
        if (!target) return '';
        const targetTrack = target.track === 'math' ? 'math' : 'algorithm';
        return `<a class="piece-link" href="${route({ piece: id, course, track: targetTrack }, 'lesson.html')}"><span class="status-dot ${progress.learned.has(id) ? 'done' : ''}"></span><span>${escape(target.title)}</span>${badgeText ? `<small class="track-mini ${targetTrack}">${escape(badgeText)}</small>` : ''}<span>↗</span></a>${note ? `<p class="edge-note">${escape(note)}</p>` : ''}`;
    };

    const preIds = prerequisites(piece.id, data.edges);
    const algPre = preIds.filter(id => track === 'math' || data.byId.get(id)?.track !== 'math');
    const appliesEdges = data.edges.filter(e => e.source === piece.id && e.relation === 'applies');
    const nextEdges = data.edges.filter(e => e.source === piece.id && e.relation === 'prerequisite');

    const isPractice = id => ['example', 'exercise'].includes(data.byId.get(id)?.type);
    const sameTrackApplies = appliesEdges.filter(e => !isPractice(e.target) && (track === 'math' || data.byId.get(e.target)?.track !== 'math'));
    const sameTrackNext = nextEdges.filter(e => !isPractice(e.target) && (track === 'math' || data.byId.get(e.target)?.track !== 'math'));
    // Worked examples and exercises adjacent to this piece, in either direction, examples first.
    const practice = [];
    for (const e of data.edges) {
        const otherId = e.source === piece.id ? e.target : e.target === piece.id ? e.source : null;
        if (!otherId || !isPractice(otherId) || preIds.includes(otherId) || practice.some(x => x.id === otherId)) continue;
        practice.push({ id: otherId, note: e.note });
    }
    practice.sort((a, b) => (data.byId.get(a.id).type === 'exercise') - (data.byId.get(b.id).type === 'exercise'));
    const practiceLabel = id => data.byId.get(id).type === 'exercise' ? 'Bài tập' : 'Ví dụ';

    const relatedOtherTrack = [];
    const seenOther = new Set();
    for (const e of data.edges) {
        const otherId = e.source === piece.id ? e.target : e.target === piece.id ? e.source : null;
        if (!otherId || seenOther.has(otherId)) continue;
        const other = data.byId.get(otherId);
        if (!other) continue;
        const otherTrack = other.track === 'math' ? 'math' : 'algorithm';
        if (otherTrack !== track) {
            seenOther.add(otherId);
            relatedOtherTrack.push({ id: otherId, note: e.note, otherTrack });
        }
    }

    const otherSectionTitle = track === 'algorithm' ? 'Lý thuyết toán học (Tách riêng)' : 'Thuật toán áp dụng lý thuyết này';
    const otherSectionHtml = relatedOtherTrack.length
        ? `<section class="detail-section math-bridge"><h2>${otherSectionTitle}</h2>${relatedOtherTrack.map(x => link(x.id, x.note, x.otherTrack === 'math' ? 'Toán' : 'Code')).join('')}</section>`
        : '';

    $('#lesson-context').innerHTML = `
        <button id="mark-learned" class="secondary" aria-pressed="${progress.learned.has(piece.id)}">${progress.learned.has(piece.id) ? '✓ Đã học · Bỏ đánh dấu' : '○ Đánh dấu đã học'}</button>
        <section class="detail-section"><h2>Cần biết trước</h2>${algPre.map(id => link(id)).join('') || '<p class="muted-text">Có thể bắt đầu trực tiếp từ bài này.</p>'}</section>
        ${practice.length ? `<section class="detail-section practice-section"><h2>Ví dụ &amp; bài tập luyện tập</h2>${practice.map(x => link(x.id, x.note, practiceLabel(x.id))).join('')}</section>` : ''}
        <section class="detail-section"><h2>Có thể áp dụng trong</h2>${sameTrackApplies.map(e => link(e.target, e.note)).join('') || '<p class="muted-text">Chưa có kết nối áp dụng cùng nhánh.</p>'}</section>
        <section class="detail-section"><h2>Học tiếp</h2>${sameTrackNext.map(e => link(e.target)).join('') || '<p class="muted-text">Quay lại đồ thị để khám phá hướng khác.</p>'}</section>
        ${otherSectionHtml}
        <a class="primary" href="${back}" style="margin-top:24px">← Về vị trí trên đồ thị</a>
    `;

    $('#mark-learned').onclick = () => {
        progress.toggle(piece.id);
        $('#mark-learned').setAttribute('aria-pressed', String(progress.learned.has(piece.id)));
        $('#mark-learned').textContent = progress.learned.has(piece.id) ? '✓ Đã học · Bỏ đánh dấu' : '○ Đánh dấu đã học';
    };

    progress.announce();
    math($('#lesson'));
    await mountVisualizer($('#algorithm-animation'), piece);
    mountCodingLab($('#coding-lab'), piece);
}

start().catch(error => {
    $('#lesson-content').innerHTML = `<h1>Không tải được bài học</h1><p>${escape(error.message)}</p><a class="primary" href="index.html">Về đồ thị</a>`;
});
window.addEventListener('hashchange', () => location.reload());
