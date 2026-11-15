const NS = 'http://www.w3.org/2000/svg';
function element(tag, attrs = {}, text = '') {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    if (text) el.textContent = text;
    return el;
}
// No course-specific labels or IDs: any set of pieces and typed edges can be rendered.
export class KnowledgeGraph {
    constructor(host, onSelect) {
        this.host = host;
        this.onSelect = onSelect;
        this.svg = element('svg', { role: 'group', 'aria-label': 'Đồ thị tương tác. Dùng Tab đến mảnh, Enter để chọn. Có thể dùng danh sách tìm kiếm thay thế.' });
        this.svg.append(element('title', {}, 'Bản đồ kết nối kiến thức'));
        host.replaceChildren(this.svg);
        this.drag = null;
        this.svg.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            this.drag = { x: event.clientX, y: event.clientY, view: { ...this.view }, moved: false, target: event.target.closest('[data-id]')?.dataset.id };
            this.svg.setPointerCapture(event.pointerId);
        });
        this.svg.addEventListener('pointermove', event => {
            if (!this.drag) return;
            const dx = event.clientX - this.drag.x, dy = event.clientY - this.drag.y;
            if (Math.abs(dx) + Math.abs(dy) > 5) this.drag.moved = true;
            const rect = this.svg.getBoundingClientRect();
            // preserveAspectRatio uses the larger world-to-screen ratio.
            const ratio = Math.max(this.drag.view.w / rect.width, this.drag.view.h / rect.height);
            this.view = { ...this.drag.view, x: this.drag.view.x - dx * ratio, y: this.drag.view.y - dy * ratio };
            this.applyView();
        });
        this.svg.addEventListener('pointerup', event => {
            const drag = this.drag;
            this.drag = null;
            if (this.svg.hasPointerCapture(event.pointerId)) this.svg.releasePointerCapture(event.pointerId);
            if (drag?.target && !drag.moved) this.onSelect(drag.target);
        });
        this.svg.addEventListener('pointercancel', () => { this.drag = null; });
        this.svg.addEventListener('keydown', event => {
            const node = event.target.closest('[data-id]');
            if (node && ['Enter', ' '].includes(event.key)) { event.preventDefault(); this.onSelect(node.dataset.id); }
        });
        this.svg.addEventListener('focusin', event => {
            const point = this.points?.get(event.target.dataset.id);
            if (point && this.view && (point.x < this.view.x || point.x > this.view.x + this.view.w || point.y < this.view.y || point.y > this.view.y + this.view.h)) this.center(point.id);
        });
        this.resize = new ResizeObserver(() => { if (this.fitted) this.fit(); });
        this.resize.observe(host);
    }
    layout(pieces, edges, chapters) {
        const n = pieces.length;
        const points = new Map();
        if (chapters) {
            let offset = 70;
            chapters.forEach((chapter, ci) => {
                chapter.pieces.filter(id => pieces.some(p => p.id === id)).forEach((id, i) => {
                    points.set(id, { id, x: 150 + (i % 3) * 310, y: offset + Math.floor(i / 3) * 115, chapter: ci });
                });
                offset += Math.ceil(chapter.pieces.filter(id => pieces.some(p => p.id === id)).length / 3) * 115 + 95;
            });
            return points;
        }
        // Deterministic force layout: stable across visits, independent of course order.
        const width = Math.max(1250, Math.sqrt(n) * 190), height = Math.max(950, Math.sqrt(n) * 140);
        const nodes = pieces.map((p, i) => ({ id: p.id, x: width / 2 + Math.cos(i * 2.39996) * Math.sqrt(i + 1) * 80, y: height / 2 + Math.sin(i * 2.39996) * Math.sqrt(i + 1) * 65 }));
        nodes.forEach(p => points.set(p.id, p));
        for (let iteration = 0; iteration < 260; iteration++) {
            const forces = new Map(nodes.map(p => [p.id, { x: (width / 2 - p.x) * .0018, y: (height / 2 - p.y) * .0018 }]));
            for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
                const a = nodes[i], b = nodes[j];
                const dx = a.x - b.x || .1, dy = a.y - b.y || .1;
                const distance = Math.max(40, Math.hypot(dx, dy));
                let push = 15000 / (distance * distance);
                if (Math.abs(dx) < 230 && Math.abs(dy) < 85) push += 2;
                forces.get(a.id).x += dx / distance * push; forces.get(a.id).y += dy / distance * push;
                forces.get(b.id).x -= dx / distance * push; forces.get(b.id).y -= dy / distance * push;
            }
            for (const edge of edges) {
                const a = points.get(edge.source), b = points.get(edge.target);
                if (!a || !b) continue;
                const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy) || 1;
                const pull = (distance - 220) * .006;
                forces.get(a.id).x += dx / distance * pull; forces.get(a.id).y += dy / distance * pull;
                forces.get(b.id).x -= dx / distance * pull; forces.get(b.id).y -= dy / distance * pull;
            }
            const cooling = 1 - iteration / 320;
            nodes.forEach(p => { const f = forces.get(p.id); p.x += Math.max(-12, Math.min(12, f.x)) * cooling; p.y += Math.max(-12, Math.min(12, f.y)) * cooling; });
        }
        return points;
    }
    render(pieces, edges, { selected, learned, chapters } = {}) {
        this.pieces = pieces;
        this.chapters = chapters;
        this.basePoints = this.layout(pieces, edges, chapters);
        this.points = new Map([...this.basePoints].map(([id, point]) => [id, { ...point }]));
        this.svg.replaceChildren(element('title', {}, 'Bản đồ kết nối kiến thức'));
        const defs = element('defs');
        const marker = element('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' });
        marker.append(element('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#8b9bbc' }));
        defs.append(marker); this.svg.append(defs);
        const links = element('g', { 'aria-hidden': 'true' });
        const nodes = element('g');
        if (chapters) chapters.forEach((chapter, i) => {
            const ps = [...this.points.values()].filter(p => p.chapter === i);
            if (ps.length) nodes.append(element('text', { x: 20, y: Math.min(...ps.map(p => p.y)) - 42, class: 'chapter-label', fill: '#5d6470', 'font-size': 22 }, `${i + 1}. ${chapter.title}`));
        });
        for (const edge of edges) {
            const a = this.points.get(edge.source), b = this.points.get(edge.target);
            if (!a || !b) continue;
            const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy) || 1;
            const x2 = b.x - dx / distance * 24, y2 = b.y - dy / distance * 24;
            links.append(element('line', { x1: a.x, y1: a.y, x2, y2, class: `edge ${edge.relation}`, 'data-source': edge.source, 'data-target': edge.target, ...(edge.relation !== 'related' ? { 'marker-end': 'url(#arrow)' } : {}) }));
        }
        for (const p of pieces) {
            const point = this.points.get(p.id);
            if (!point) continue;
            const group = element('g', { class: 'graph-node', 'data-id': p.id, tabindex: '0', role: 'button', 'aria-label': p.title, transform: `translate(${point.x},${point.y})` });
            group.append(element('title', {}, p.title), element('circle', { r: 23 }), element('circle', { r: 23, class: 'hit-area', style: 'fill:transparent;stroke:none' }), element('text', { class: 'node-symbol', 'text-anchor': 'middle', y: 5 }, p.type === 'formula' ? 'ƒ' : p.type === 'exercise' ? '?' : p.type === 'theorem' ? '∴' : p.type === 'example' ? '↗' : '·'));
            const words = p.title.split(' '), lines = [''];
            for (const word of words) {
                const last = lines.length - 1;
                if ((lines[last] + ' ' + word).trim().length > 26 && lines[last]) lines.push(word);
                else lines[last] = (lines[last] + ' ' + word).trim();
            }
            const label = element('text', { 'text-anchor': 'middle', y: 52 });
            lines.slice(0, 2).forEach((line, i) => label.append(element('tspan', { x: 0, dy: i ? 24 : 0 }, line + (i === 1 && lines.length > 2 ? '…' : ''))));
            group.append(label);
            nodes.append(group);
        }
        this.svg.append(links, nodes);
        this.update(selected, learned, edges);
        this.fit();
    }
    update(selected, learned = new Set(), edges = []) {
        const neighbors = new Set([selected]);
        edges.filter(e => e.source === selected || e.target === selected).forEach(e => { neighbors.add(e.source); neighbors.add(e.target); });
        this.points = new Map([...this.basePoints].map(([id, point]) => [id, { ...point }]));
        const center = this.points.get(selected);
        if (center && !this.chapters) {
            const ids = [...neighbors].filter(id => id !== selected && this.points.has(id));
            ids.forEach((id, i) => {
                const ring = Math.floor(i / 7), count = Math.min(7, ids.length - ring * 7);
                const angle = -Math.PI / 2 + (i % 7) / count * Math.PI * 2 + (ring % 2 ? .3 : 0);
                const r = 265 + ring * 220;
                this.points.set(id, { ...this.points.get(id), x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r });
            });
        }
        this.svg.querySelectorAll('.graph-node').forEach(node => {
            const id = node.dataset.id;
            const point = this.points.get(id);
            node.setAttribute('transform', `translate(${point.x},${point.y})`);
            node.classList.toggle('selected', id === selected);
            node.classList.toggle('learned', learned.has(id));
            node.classList.toggle('muted', !!selected && !neighbors.has(id));
            node.setAttribute('aria-pressed', String(id === selected));
            if (neighbors.has(id)) node.parentNode.append(node);
        });
        this.svg.querySelectorAll('.edge').forEach(edge => {
            const a = this.points.get(edge.dataset.source), b = this.points.get(edge.dataset.target);
            const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
            edge.setAttribute('x1', a.x); edge.setAttribute('y1', a.y);
            edge.setAttribute('x2', b.x - dx / d * 24); edge.setAttribute('y2', b.y - dy / d * 24);
            const active = edge.dataset.source === selected || edge.dataset.target === selected;
            edge.classList.toggle('highlight', active);
            edge.classList.toggle('muted', !!selected && !active);
        });
    }
    fit() {
        const points = [...(this.points?.values() || [])];
        if (!points.length) { this.view = { x: 0, y: 0, w: 1000, h: 700 }; this.applyView(); return; }
        const xs = points.map(p => p.x), ys = points.map(p => p.y);
        const minX = Math.min(...xs) - 180, minY = Math.min(...ys) - 80;
        this.view = { x: minX, y: minY, w: Math.max(...xs) - minX + 180, h: Math.max(...ys) - minY + 120 };
        this.fitted = true;
        this.applyView();
    }
    zoom(factor) {
        if (!this.view) return;
        const w = Math.max(220, Math.min(14000, this.view.w / factor)), h = w * this.view.h / this.view.w;
        this.view = { x: this.view.x + (this.view.w - w) / 2, y: this.view.y + (this.view.h - h) / 2, w, h };
        this.fitted = false;
        this.applyView();
    }
    center(id) {
        const point = this.points.get(id);
        if (!point) return;
        const minW = this.host.clientWidth < 520 ? 700 : 460;
        const w = Math.min(1050, Math.max(minW, this.host.clientWidth * 1.5)), h = w * this.host.clientHeight / Math.max(1, this.host.clientWidth);
        this.view = { x: point.x - w / 2, y: point.y - h / 2, w, h };
        this.fitted = false;
        this.applyView();
    }
    applyView() {
        if (!this.view) return;
        this.svg.setAttribute('viewBox', `${this.view.x} ${this.view.y} ${this.view.w} ${this.view.h}`);
        const scale = Math.min(this.host.clientWidth / this.view.w, this.host.clientHeight / this.view.h) || 1;
        this.svg.querySelectorAll('.hit-area').forEach(circle => circle.setAttribute('r', Math.max(23, 22 / scale)));
    }
}
