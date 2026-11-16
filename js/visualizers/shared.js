const SVG_NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) node.setAttribute(k, '');
        else node.setAttribute(k, String(v));
    }
    for (const child of children.flat()) {
        if (child == null || child === false) continue;
        node.append(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
    }
    return node;
}

export function svgEl(tag, attrs = {}, ...children) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;
        node.setAttribute(k, String(v));
    }
    for (const child of children.flat()) {
        if (child == null || child === false) continue;
        node.append(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
    }
    return node;
}

export function parseNumberList(raw, fallback = [5, 2, 8, 1, 9, 3], { min = -99, max = 999, maxLen = 12, minLen = 2 } = {}) {
    const nums = String(raw || '')
        .split(/[\s,;]+/)
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n))
        .map(n => Math.max(min, Math.min(max, Math.round(n))))
        .slice(0, maxLen);
    return nums.length >= minLen ? nums : [...fallback];
}

export function createStepper(host, spec) {
    let steps = Array.isArray(spec.steps) && spec.steps.length ? spec.steps : [{ msg: 'Sẵn sàng.' }];
    let index = Math.max(0, Math.min(spec.defaultStep || 0, steps.length - 1));
    let timer = null;
    let speed = 780;

    host.innerHTML = '';

    const badge = el('span', { class: `viz-badge ${spec.track === 'math' ? 'math' : ''}`, text: spec.badge || (spec.track === 'math' ? 'Trực quan Toán' : 'Mô phỏng từng bước') });
    const header = el('div', { class: 'viz-header' },
        el('div', {},
            el('div', { class: 'viz-title-row' }, el('h3', { text: spec.title || 'Mô phỏng trực quan' }), badge),
            spec.subtitle ? el('p', { class: 'viz-subtitle', text: spec.subtitle }) : null
        )
    );

    const presetsWrap = spec.presets?.length ? el('div', { class: 'viz-presets' }) : null;
    const inputWrap = spec.controlsNode ? el('div', { class: 'viz-input-row' }, spec.controlsNode) : null;

    const btnPrev = el('button', { type: 'button', class: 'viz-btn', text: '‹ Lùi' });
    const btnPlay = el('button', { type: 'button', class: 'viz-btn primary', text: '▶ Chạy' });
    const btnNext = el('button', { type: 'button', class: 'viz-btn', text: 'Bước tiếp ›' });
    const btnReset = el('button', { type: 'button', class: 'viz-btn', text: '↺ Đặt lại' });
    const speedInput = el('input', { type: 'range', min: '250', max: '1500', step: '50', value: String(1750 - speed), 'aria-label': 'Tốc độ mô phỏng' });
    const speedLabel = el('label', { class: 'viz-speed' }, 'Tốc độ', speedInput);

    const controls = el('div', { class: 'viz-controls' }, btnPrev, btnPlay, btnNext, btnReset, speedLabel);
    const statsEl = el('div', { class: 'viz-stats', hidden: !spec.stats });
    const stageEl = el('div', { class: 'viz-stage' });
    const counterEl = el('span', { class: 'viz-step-counter' });
    const msgEl = el('span', {});
    const stepLogEl = el('div', { class: 'viz-step-log', role: 'status', 'aria-live': 'polite' }, counterEl, msgEl);
    const codeTraceEl = spec.codeLines?.length
        ? el('div', { class: 'viz-code-trace' }, spec.codeLines.map((line, i) => el('div', { class: 'viz-code-line', 'data-line': String(i), text: line })))
        : null;

    host.append(header, presetsWrap, inputWrap, controls, statsEl, stageEl, stepLogEl, codeTraceEl);

    function stop() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        btnPlay.textContent = '▶ Chạy';
    }

    function draw() {
        const frame = steps[index] || steps[0];
        counterEl.textContent = `Bước ${index + 1}/${steps.length}`;
        msgEl.textContent = frame.msg || '';
        btnPrev.disabled = index <= 0;
        btnNext.disabled = index >= steps.length - 1;

        if (spec.stats) {
            const list = spec.stats(frame, index, steps) || [];
            statsEl.hidden = list.length === 0;
            statsEl.replaceChildren(...list.map(([k, v]) => el('span', { class: 'viz-stat', text: `${k}: ${v}` })));
        }

        if (codeTraceEl) {
            const activeLines = new Set(Array.isArray(frame.lines) ? frame.lines : frame.line != null ? [frame.line] : []);
            for (const lineNode of codeTraceEl.children) {
                lineNode.classList.toggle('active', activeLines.has(Number(lineNode.dataset.line)));
            }
        }

        stageEl.innerHTML = '';
        spec.render(stageEl, frame, index, steps);
    }

    function go(nextIdx) {
        index = Math.max(0, Math.min(nextIdx, steps.length - 1));
        if (index >= steps.length - 1) stop();
        draw();
    }

    function play() {
        if (timer) {
            stop();
            return;
        }
        if (index >= steps.length - 1) index = 0;
        btnPlay.textContent = '⏸ Tạm dừng';
        draw();
        timer = setInterval(() => {
            if (index >= steps.length - 1) {
                stop();
                return;
            }
            index++;
            draw();
        }, speed);
    }

    btnPrev.addEventListener('click', () => { stop(); go(index - 1); });
    btnNext.addEventListener('click', () => { stop(); go(index + 1); });
    btnReset.addEventListener('click', () => { stop(); go(0); });
    btnPlay.addEventListener('click', play);
    speedInput.addEventListener('input', () => {
        speed = 1750 - Number(speedInput.value);
        if (timer) {
            stop();
            play();
        }
    });

    if (presetsWrap) {
        spec.presets.forEach((preset, i) => {
            const b = el('button', {
                type: 'button',
                class: `viz-preset-btn ${i === 0 ? 'active' : ''}`,
                text: preset.label
            });
            b.addEventListener('click', () => {
                stop();
                for (const child of presetsWrap.children) child.classList.remove('active');
                b.classList.add('active');
                const nextSteps = typeof preset.steps === 'function' ? preset.steps() : preset.steps;
                if (spec.onPreset) spec.onPreset(preset);
                if (Array.isArray(nextSteps) && nextSteps.length) {
                    steps = nextSteps;
                    index = 0;
                    draw();
                }
            });
            presetsWrap.append(b);
        });
    }

    draw();

    return {
        update(nextSteps, startIdx = 0) {
            stop();
            steps = Array.isArray(nextSteps) && nextSteps.length ? nextSteps : [{ msg: 'Sẵn sàng.' }];
            index = Math.max(0, Math.min(startIdx, steps.length - 1));
            draw();
        },
        go,
        stop,
        getStep: () => index,
        el: host
    };
}

export function renderBars(stage, arr, highlights = {}, tags = {}) {
    const vals = arr.map(v => typeof v === 'object' ? v.val : v);
    const maxVal = Math.max(1, ...vals.map(v => Math.abs(v)));
    const minVal = Math.min(0, ...vals);
    const span = Math.max(1, maxVal - minVal);
    const wrap = el('div', { class: 'viz-bars' });

    arr.forEach((item, i) => {
        const val = typeof item === 'object' ? item.val : item;
        const label = typeof item === 'object' && item.label != null ? item.label : String(val);
        const h = Math.max(18, Math.round(((val - minVal) / span) * 108) + 16);
        const state = highlights[i] ? `is-${highlights[i]}` : '';
        const tagText = tags[i] || '';
        wrap.append(
            el('div', { class: 'viz-bar-col' },
                el('span', { class: 'viz-bar-tag', text: tagText }),
                el('span', { class: 'viz-bar-val', text: label }),
                el('div', { class: `viz-bar ${state}`, style: { height: `${h}px` } }),
                el('span', { class: 'viz-bar-idx', text: `[${i}]` })
            )
        );
    });
    stage.append(wrap);
}

export function renderCells(stage, items, highlights = {}, caption = '') {
    if (caption) stage.append(el('p', { style: { fontSize: '12px', color: '#465063', marginBottom: '8px', textAlign: 'center', fontWeight: '600' }, text: caption }));
    const row = el('div', { class: 'viz-cells' });
    items.forEach((item, i) => {
        const val = typeof item === 'object' && item !== null ? item.val : item;
        const sub = typeof item === 'object' && item !== null ? (item.sub ?? `[${i}]`) : `[${i}]`;
        const cls = highlights[i] ? `is-${highlights[i]}` : '';
        row.append(el('div', { class: `viz-cell ${cls}` }, String(val), sub !== '' ? el('small', { text: String(sub) }) : null));
    });
    stage.append(row);
}

export function renderLinkedList(stage, nodes, { activeIdx = -1, foundIdx = -1, circular = false, doubly = false, tailPointer = false } = {}) {
    const wrap = el('div', { class: 'viz-ll-list' });
    wrap.append(el('span', { class: 'viz-stat', text: 'head' }), el('span', { class: 'viz-ll-arrow', text: '→' }));
    if (!nodes.length) {
        wrap.append(el('span', { class: 'viz-stat', text: 'null' }));
        stage.append(wrap);
        return;
    }
    nodes.forEach((val, i) => {
        const cls = i === foundIdx ? 'is-found' : i === activeIdx ? 'is-active' : '';
        const box = el('div', { class: `viz-ll-node ${cls}` },
            doubly ? el('span', { class: 'viz-ll-next', text: i === 0 ? (circular ? '↺' : '∅') : '←' }) : null,
            el('span', { class: 'viz-ll-data', text: String(val) }),
            el('span', { class: 'viz-ll-next', text: i === nodes.length - 1 ? (circular ? '↺ head' : 'null') : 'next' })
        );
        wrap.append(box);
        if (i < nodes.length - 1) wrap.append(el('span', { class: 'viz-ll-arrow', text: doubly ? '⇄' : '→' }));
    });
    if (tailPointer) wrap.append(el('span', { class: 'viz-ll-arrow', text: '←' }), el('span', { class: 'viz-stat', text: `tail=${nodes[nodes.length - 1]}` }));
    stage.append(wrap);
}

export function renderMatrix(stage, grid, { rowHeaders = null, colHeaders = null, cellClass = null } = {}) {
    const table = el('table', { class: 'viz-matrix' });
    if (colHeaders) {
        const thead = el('thead');
        const tr = el('tr');
        if (rowHeaders) tr.append(el('th', { text: '' }));
        colHeaders.forEach(h => tr.append(el('th', { text: String(h) })));
        thead.append(tr);
        table.append(thead);
    }
    const tbody = el('tbody');
    grid.forEach((row, r) => {
        const tr = el('tr');
        if (rowHeaders) tr.append(el('th', { text: String(rowHeaders[r] ?? r) }));
        row.forEach((cell, c) => {
            const cls = cellClass ? cellClass(r, c, cell) : '';
            tr.append(el('td', { class: cls, text: cell === Infinity ? '∞' : cell == null ? '·' : String(cell) }));
        });
        tbody.append(tr);
    });
    table.append(tbody);
    stage.append(table);
}

export function renderSvgGraph(stage, { width = 560, height = 250, nodes = [], edges = [], directed = false, arrows = false } = {}) {
    const svg = svgEl('svg', { class: 'viz-svg', viewBox: `0 0 ${width} ${height}` });
    if (directed || arrows) {
        const defs = svgEl('defs', {},
            svgEl('marker', { id: 'viz-arrow', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' },
                svgEl('path', { d: 'M 0 1 L 10 5 L 0 9 z', fill: '#5d677a' })
            ),
            svgEl('marker', { id: 'viz-arrow-active', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' },
                svgEl('path', { d: 'M 0 1 L 10 5 L 0 9 z', fill: '#1f2de6' })
            ),
            svgEl('marker', { id: 'viz-arrow-done', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' },
                svgEl('path', { d: 'M 0 1 L 10 5 L 0 9 z', fill: '#20694b' })
            )
        );
        svg.append(defs);
    }

    const pos = new Map(nodes.map(n => [n.id, n]));
    for (const e of edges) {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const r = e.radius || 18;
        const x1 = a.x + (dx / dist) * (directed ? r + 1 : 0);
        const y1 = a.y + (dy / dist) * (directed ? r + 1 : 0);
        const x2 = b.x - (dx / dist) * (directed ? r + 4 : 0);
        const y2 = b.y - (dy / dist) * (directed ? r + 4 : 0);
        const stroke = e.state === 'active' ? '#1f2de6' : e.state === 'done' ? '#20694b' : e.state === 'reject' ? '#dc2626' : '#aeb8c9';
        const strokeWidth = e.state === 'active' || e.state === 'done' ? 2.8 : 1.7;
        svg.append(svgEl('line', {
            x1: directed ? x1 : a.x,
            y1: directed ? y1 : a.y,
            x2: directed ? x2 : b.x,
            y2: directed ? y2 : b.y,
            stroke,
            'stroke-width': strokeWidth,
            'stroke-dasharray': e.state === 'reject' ? '4 3' : null,
            'marker-end': directed ? (e.state === 'active' ? 'url(#viz-arrow-active)' : e.state === 'done' ? 'url(#viz-arrow-done)' : 'url(#viz-arrow)') : null
        }));
        if (e.label != null) {
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - 5;
            svg.append(svgEl('rect', { x: mx - 11, y: my - 10, width: 22, height: 15, rx: 4, fill: '#f8fafd' }));
            svg.append(svgEl('text', { x: mx, y: my + 1, 'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: e.state === 'active' ? '#1f2de6' : '#334155' }, String(e.label)));
        }
    }

    for (const n of nodes) {
        const r = n.r || 19;
        const fill = n.state === 'active' ? '#eef1ff' : n.state === 'done' ? '#edf7f1' : n.state === 'compare' ? '#fffbeb' : n.state === 'warn' ? '#fef2f2' : '#ffffff';
        const stroke = n.state === 'active' ? '#1f2de6' : n.state === 'done' ? '#20694b' : n.state === 'compare' ? '#d97706' : n.state === 'warn' ? '#dc2626' : '#64748b';
        svg.append(svgEl('circle', { cx: n.x, cy: n.y, r, fill, stroke, 'stroke-width': n.state === 'active' ? 2.6 : 1.8 }));
        svg.append(svgEl('text', { x: n.x, y: n.y + 4, 'text-anchor': 'middle', 'font-size': n.fontSize || '13', 'font-weight': '700', fill: '#0b0c0e' }, String(n.label ?? n.id)));
        if (n.sub != null) {
            svg.append(svgEl('text', { x: n.x, y: n.y + r + 13, 'text-anchor': 'middle', 'font-size': '10.5', 'font-weight': '600', fill: '#475569' }, String(n.sub)));
        }
    }
    stage.append(svg);
}
