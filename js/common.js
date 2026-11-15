import { loadProgress, saveProgress, route, TYPES } from './model.mjs';
export const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const $ = selector => document.querySelector(selector);
document.querySelector('.skip-link')?.addEventListener('click', event => {
    const target = document.querySelector(event.currentTarget.getAttribute('href'));
    if (target) { event.preventDefault(); target.focus(); }
});
export async function json(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Không tải được ${path} (${response.status})`);
    return response.json();
}
export async function loadData() {
    const [data, index] = await Promise.all([json('data/pieces.json'), json('data/courses/index.json')]);
    const courses = await Promise.all(index.courses.map(id => json(`data/courses/${encodeURIComponent(id)}.json`)));
    return { ...data, courses, byId: new Map(data.pieces.map(p => [p.id, p])) };
}
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const initial = loadProgress(storage);
export const progress = { ...initial, toggle(id) {
    this.learned.has(id) ? this.learned.delete(id) : this.learned.add(id);
    this.available = saveProgress(storage, this.learned);
    this.announce();
}, announce() {
    const el = $('#storage-status');
    if (el) el.textContent = this.available ? 'Tiến độ lưu trên thiết bị này' : 'Không lưu được trên thiết bị. Tiến độ chỉ giữ trong lần mở này.';
} };
export function math(element = document.body) {
    if (window.renderMathInElement) window.renderMathInElement(element, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, trust: false });
}
export function inline(text) {
    return escape(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}
// Deliberately small Markdown subset. Raw HTML and arbitrary links are never executed.
export function markdown(text) {
    let code = false, list = false, output = '';
    for (const line of text.split(/\r?\n/)) {
        if (line.startsWith('```')) {
            if (list) { output += '</ul>'; list = false; }
            output += code ? '</code></pre>' : '<pre><code>'; code = !code; continue;
        }
        if (code) { output += escape(line) + '\n'; continue; }
        if (!line.startsWith('- ') && list) { output += '</ul>'; list = false; }
        if (/^#{1,3} /.test(line)) {
            const level = line.match(/^#+/)[0].length;
            output += `<h${level}>${inline(line.slice(level + 1))}</h${level}>`;
        } else if (line.startsWith('- ')) {
            if (!list) { output += '<ul>'; list = true; }
            output += `<li>${inline(line.slice(2))}</li>`;
        } else if (line.trim()) output += `<p>${inline(line)}</p>`;
    }
    if (list) output += '</ul>';
    if (code) output += '</code></pre>';
    return output;
}
export function sourceLinks(piece) {
    return piece.sources.map(s => {
        const page = String(s.page).match(/\d+/)?.[0] || '1';
        const href = s.file.split('/').map(encodeURIComponent).join('/') + `#page=${page}`;
        return `<a class="source-link" href="${escape(href)}" target="_blank" rel="noopener">${escape(s.file.split('/').at(-1))}<span>Trang ${escape(s.page)} ↗</span></a>`;
    }).join('');
}
export function pieceLink(piece, course, extra = '') {
    return `<a class="piece-link" href="${route({ piece: piece.id, course })}"><span class="status-dot ${progress.learned.has(piece.id) ? 'done' : ''}"></span><span>${escape(piece.title)}</span>${extra}<span aria-hidden="true">↗</span></a>`;
}
export function badge(piece) { return `<span class="type-label ${piece.type}">${TYPES[piece.type]}</span><span class="level">Mức ${piece.difficulty}/3</span>`; }
