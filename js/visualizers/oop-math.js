import { createStepper, el, renderCells, svgEl } from './shared.js';

function curveStage(stage, f) {
    const W = 520, H = 220;
    const svg = svgEl('svg', { class: 'viz-svg', viewBox: `0 0 ${W} ${H}` });
    const fns = [
        ['n', n => n, '#20694b'], ['n log n', n => n * Math.log2(Math.max(n, 1)), '#1f2de6'],
        ['n²', n => n * n, '#dc2626']
    ];
    const maxN = 20, maxY = 200;
    fns.slice(0, f.show).forEach(([name, fn, color], k) => {
        let d = '';
        for (let n = 1; n <= maxN; n++) {
            const x = 30 + (n / maxN) * (W - 50);
            const y = H - 20 - Math.min(fn(n), maxY) / maxY * (H - 40);
            d += `${n === 1 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
        }
        svg.append(svgEl('path', { d, fill: 'none', stroke: color, 'stroke-width': 2.5 }));
        svg.append(svgEl('text', { x: W - 70, y: 20 + k * 16, fill: color, 'font-size': 12, 'font-weight': 700 }, name));
    });
    stage.append(svg);
}

function simpleCards(piece, items) {
    return {
        title: piece.title,
        steps: items.map(([a, b]) => ({ cells: a, msg: b })),
        render: (stage, f) => renderCells(stage, f.cells.map(c => ({ val: c, sub: '' })), { 0: 'active' })
    };
}

function turingSteps() {
    const tape = [...'1101_'];
    const steps = [];
    let head = 0;
    steps.push({ tape: [...tape], head, state: 'q0', msg: 'Máy Turing đảo bit: bắt đầu ở q0 tại ô đầu.' });
    while (head < 4) {
        tape[head] = tape[head] === '1' ? '0' : '1';
        head++;
        steps.push({ tape: [...tape], head, state: 'q0', msg: `Đảo bit và sang phải (đầu đọc ở ô ${head}).` });
    }
    steps.push({ tape: [...tape], head, state: 'halt', msg: 'Gặp ô trống, dừng ở trạng thái halt.' });
    return steps;
}

export function mountOopMath(host, piece) {
    const id = piece.id;
    let spec;
    if (id === 'turing-machine' || id === 'hw-turing') {
        spec = { title: 'Máy Turing đảo bit', steps: turingSteps(), render: (s, f) => renderCells(s, f.tape.map((c, i) => ({ val: c, sub: i === f.head ? `▲ ${f.state}` : '' })), { [f.head]: 'active' }, 'Băng') };
    } else if (id === 'big-o' || id === 'running-time-model' || id === 'complexity-classes' || id === 'best-worst-average' || id === 'sum-product-rules') {
        spec = { title: 'So sánh tốc độ tăng: n, n log n, n²', steps: [1, 2, 3].map(k => ({ show: k, msg: ['Tuyến tính n tăng đều.', 'Thêm n log n: chậm hơn một chút.', 'n² tăng rất nhanh khi n lớn.'][k - 1] })), render: curveStage };
    } else if (id === 'master-theorem' || id === 'recurrence-relation' || id === 'substitution-method' || id === 'hw-recurrences' || id === 'recursion-correctness') {
        const rows = [];
        const n = 16;
        for (let l = 0, size = n, cnt = 1; size >= 1; l++, size /= 2, cnt *= 2) rows.push(`Tầng ${l}: ${cnt} bài toán cỡ ${size}, tổng công việc ${cnt * size}`);
        spec = { title: 'T(n) = 2T(n/2) + n, n = 16', steps: rows.map((_, i) => ({ rows: rows.slice(0, i + 1), msg: `Mỗi tầng tốn n = ${n}, có log₂n + 1 tầng nên T(n) = Θ(n log n).` })), render: (s, f) => s.append(el('pre', { class: 'viz-code-trace', text: f.rows.join('\n') })) };
    } else if (id === 'bubble-sort-cost') {
        const n = 6;
        spec = { title: 'Số phép so sánh của Bubble Sort', steps: Array.from({ length: n - 1 }, (_, i) => ({ k: i + 1, msg: `Lượt ${i + 1}: ${n - 1 - i} phép so sánh. Tổng đến đây: ${Array.from({ length: i + 1 }, (_, q) => n - 1 - q).reduce((a, b) => a + b)}.` })), render: (s, f) => renderCells(s, Array.from({ length: n - 1 }, (_, q) => ({ val: q < f.k ? n - 1 - q : '·', sub: `lượt ${q + 1}` })), { [f.k - 1]: 'active' }) };
    } else if (id === 'full-binary-tree-height' || id === 'heap-height') {
        spec = { title: 'Số nút theo chiều cao h', steps: [1, 2, 3, 4].map(h => ({ h, msg: `h = ${h}: tối đa ${2 ** h - 1} nút (cây đầy).` })), render: (s, f) => renderCells(s, Array.from({ length: f.h }, (_, i) => ({ val: 2 ** i, sub: `mức ${i}` })), { [f.h - 1]: 'active' }) };
    } else if (id === 'comparison-sort-lower-bound') {
        spec = { title: 'Cận dưới n log n của sắp xếp so sánh', steps: [3, 4, 5].map(n => ({ n, msg: `${n} phần tử có ${[...Array(n).keys()].reduce((a, b) => a * (b + 1), 1)} hoán vị nên cây quyết định cao ít nhất ⌈log₂(n!)⌉.` })), render: (s, f) => renderCells(s, [`${f.n}!`], { 0: 'active' }) };
    } else {
        spec = simpleCards(piece, [[['Interface', 'Class'], 'Interface chỉ mô tả hợp đồng, class cài đặt.'], [['Generic<T>', 'Comparable<T>'], 'Tham số kiểu cho phép tái sử dụng code với nhiều kiểu dữ liệu.']]);
    }
    createStepper(host, { subtitle: piece.summary, track: piece.track, ...spec });
}
