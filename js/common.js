import { loadProgress, saveProgress, route, TYPES, TRACKS } from './model.mjs';
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
const THEME_KEY = 'hus.theme.v1';
function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = isDark ? '#0b1120' : '#f7f8fc';
    const btn = $('#theme-toggle');
    if (btn) {
        btn.setAttribute('aria-pressed', String(isDark));
        btn.textContent = isDark ? '☀️ Sáng' : '🌙 Tối';
        btn.title = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
    }
}
function initTheme() {
    let saved = null;
    try { saved = storage?.getItem(THEME_KEY); } catch { saved = null; }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    applyTheme(saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light'));
    $('#theme-toggle')?.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { storage?.setItem(THEME_KEY, next); } catch { /* ignore storage errors */ }
    });
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', e => {
        let current = null;
        try { current = storage?.getItem(THEME_KEY); } catch { current = null; }
        if (current !== 'dark' && current !== 'light') applyTheme(e.matches ? 'dark' : 'light');
    });
}
initTheme();
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
// Cross-lesson links: [[piece-id]] or [[piece-id|văn bản]] resolve against the loaded pieces.
let pieceIndex = null, linkCourse;
export function setPieceIndex(byId, course) { pieceIndex = byId; linkCourse = course; }
function crossLink(id, label) {
    const target = pieceIndex?.get(id);
    if (!target) return `<span class="xref missing">${label || id}</span>`;
    const track = target.track === 'math' ? 'math' : 'algorithm';
    const done = progress.learned.has(id) ? ' done' : '';
    return `<a class="xref ${target.type}${done}" href="${route({ piece: id, course: linkCourse, track }, 'lesson.html')}">${label || escape(target.title)}</a>`;
}
export function inline(text) {
    const tokens = [];
    const stash = html => { tokens.push(html); return `\u0000${tokens.length - 1}\u0000`; };
    let s = escape(text)
        .replace(/`([^`]+)`/g, (_, code) => stash(`<code>${code}</code>`))
        .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (_, id, label) => stash(crossLink(id, label)))
        .replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, m => stash(m));
    s = s.replace(/\*\*([^\s*](?:[^*\n]*?[^\s*])?)\*\*/g, '<strong>$1</strong>')
         .replace(/(^|[^\w*])\*([^\s*](?:[^*\n]*?[^\s*])?)\*(?=[^\w*]|$)/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, idx) => tokens[Number(idx)]);
}
function splitTableRow(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
}
const isTableSep = line => /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(line.trim());
const CODE_KEYWORDS = new Set([
    'abstract', 'boolean', 'break', 'case', 'catch', 'char', 'class', 'const', 'continue',
    'default', 'do', 'double', 'else', 'enum', 'extends', 'false', 'final', 'finally',
    'float', 'for', 'function', 'if', 'implements', 'import', 'instanceof', 'int',
    'interface', 'let', 'long', 'new', 'null', 'package', 'private', 'protected',
    'public', 'return', 'short', 'static', 'super', 'switch', 'this', 'throw', 'throws',
    'true', 'try', 'var', 'void', 'while'
]);
const CODE_TYPES = new Set([
    'Arrays', 'ArrayList', 'Collections', 'Comparable', 'Comparator', 'Deque', 'HashMap',
    'HashSet', 'Integer', 'LinkedList', 'List', 'Map', 'Math', 'Object', 'PriorityQueue',
    'Queue', 'Set', 'Stack', 'String', 'StringBuilder', 'System'
]);
function highlightCode(raw) {
    const tokenRe = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
    let out = '', last = 0;
    for (const m of raw.matchAll(tokenRe)) {
        if (m.index > last) out += escape(raw.slice(last, m.index));
        const tok = m[0];
        if (tok.startsWith('//') || tok.startsWith('/*')) out += `<span class="tok-comment">${escape(tok)}</span>`;
        else if (tok.startsWith('"') || tok.startsWith("'")) out += `<span class="tok-string">${escape(tok)}</span>`;
        else if (/^\d/.test(tok)) out += `<span class="tok-number">${escape(tok)}</span>`;
        else if (CODE_KEYWORDS.has(tok)) out += `<span class="tok-kw">${escape(tok)}</span>`;
        else if (CODE_TYPES.has(tok)) out += `<span class="tok-type">${escape(tok)}</span>`;
        else out += escape(tok);
        last = m.index + tok.length;
    }
    if (last < raw.length) out += escape(raw.slice(last));
    return out;
}
// Safe Markdown subset for structured visual lessons. Raw HTML and arbitrary links are never executed.
export function markdown(text) {
    const lines = text.split(/\r?\n/);
    let output = '', code = false, codeLines = [], mathBlock = false, listTag = null, quote = [];
    const flushList = () => { if (listTag) { output += `</${listTag}>`; listTag = null; } };
    const flushQuote = () => {
        if (!quote.length) return;
        output += `<blockquote class="callout">${quote.map(q => `<p>${inline(q)}</p>`).join('')}</blockquote>`;
        quote = [];
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // ::: Tiêu đề ... ::: renders a collapsible block (lời giải, gợi ý từng bậc).
        if (!code && !mathBlock && /^:::\s*\S/.test(line)) {
            flushList(); flushQuote();
            const title = line.replace(/^:::\s*/, '');
            const inner = [];
            i++;
            while (i < lines.length && lines[i].trim() !== ':::') inner.push(lines[i++]);
            output += `<details class="answer-reveal"><summary>${inline(title)}</summary><div class="answer-body">${markdown(inner.join('\n'))}</div></details>`;
            continue;
        }
        if (line.startsWith('```')) {
            flushList(); flushQuote();
            if (code) { output += highlightCode(codeLines.join('\n')) + '</code></pre></div>'; code = false; codeLines = []; }
            else {
                const lang = escape(line.slice(3).trim() || 'Code');
                output += `<div class="code-block"><div class="code-head"><span>${lang}</span><button class="copy-code-btn" type="button">Sao chép</button></div><pre><code>`;
                code = true;
                codeLines = [];
            }
            continue;
        }
        if (code) { codeLines.push(line); continue; }
        if (line.trim() === '$$') {
            flushList(); flushQuote();
            output += mathBlock ? '$$\n</div>' : '<div class="math-block">$$\n';
            mathBlock = !mathBlock;
            continue;
        }
        if (mathBlock) { output += escape(line) + '\n'; continue; }
        if (line.startsWith('> ')) { flushList(); quote.push(line.slice(2)); continue; }
        flushQuote();
        if (line.trim().startsWith('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
            flushList();
            const headers = splitTableRow(line);
            i += 2;
            const rows = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                rows.push(splitTableRow(lines[i]));
                i++;
            }
            i--;
            output += `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${headers.map((_, idx) => `<td>${inline(r[idx] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
            continue;
        }
        if (/^#{1,3} /.test(line)) {
            flushList();
            const level = line.match(/^#+/)[0].length;
            output += `<h${level}>${inline(line.slice(level + 1))}</h${level}>`;
        } else if (line.startsWith('- ')) {
            if (listTag !== 'ul') { flushList(); output += '<ul>'; listTag = 'ul'; }
            output += `<li>${inline(line.slice(2))}</li>`;
        } else if (/^\d+\.\s+/.test(line)) {
            if (listTag !== 'ol') { flushList(); output += '<ol>'; listTag = 'ol'; }
            output += `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`;
        } else if (line.trim()) {
            flushList();
            output += `<p>${inline(line)}</p>`;
        } else {
            flushList();
        }
    }
    flushList(); flushQuote();
    if (code) output += highlightCode(codeLines.join('\n')) + '</code></pre></div>';
    if (mathBlock) output += '$$</div>';
    return output;
}
export function pieceLink(piece, course, extra = '') {
    return `<a class="piece-link" href="${route({ piece: piece.id, course })}"><span class="status-dot ${progress.learned.has(piece.id) ? 'done' : ''}"></span><span>${escape(piece.title)}</span>${extra}<span aria-hidden="true">↗</span></a>`;
}
export function trackBadge(piece) {
    const t = piece.track === 'math' ? 'math' : 'algorithm';
    return `<span class="track-label ${t}">${escape(TRACKS[t])}</span>`;
}
export function badge(piece) { return `${trackBadge(piece)}<span class="type-label ${piece.type}">${TYPES[piece.type]}</span><span class="level">Mức ${piece.difficulty}/3</span>`; }
