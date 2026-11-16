import { createStepper, el, renderCells, renderMatrix } from './shared.js';

function textStage(stage, f) {
    if (f.cells) renderCells(stage, f.cells, f.hi || {}, f.caption || '');
    if (f.lines) stage.append(el('pre', { class: 'viz-code-trace', text: f.lines.join('\n') }));
}

function hanoiSteps(n) {
    const pegs = { A: Array.from({ length: n }, (_, i) => n - i), B: [], C: [] };
    const snap = () => ({ A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] });
    const steps = [{ pegs: snap(), msg: `${n} đĩa trên cột A. Cần chuyển sang C: cần ${2 ** n - 1} lần chuyển.` }];
    let count = 0;
    (function move(k, a, b, c) {
        if (k === 0) return;
        move(k - 1, a, c, b);
        pegs[c].push(pegs[a].pop());
        count++;
        steps.push({ pegs: snap(), msg: `Lần ${count}: chuyển đĩa ${k} từ ${a} sang ${c}.` });
        move(k - 1, b, a, c);
    })(n, 'A', 'B', 'C');
    return steps;
}

function fibSteps(n) {
    const calls = [];
    const memo = new Map();
    const steps = [{ calls: [], hits: 0, msg: `Tính fib(${n}) bằng đệ quy thuần: nhiều lời gọi lặp lại.` }];
    (function f(k, d) {
        calls.push(`${' '.repeat(d * 2)}fib(${k})`);
        steps.push({ calls: [...calls], msg: `Gọi fib(${k}).` });
        if (k > 1) { f(k - 1, d + 1); f(k - 2, d + 1); }
    })(n, 0);
    steps.push({ calls: [...calls], msg: `Tổng ${calls.length} lời gọi. Với ghi nhớ (memo) chỉ cần ${n + 1} giá trị khác nhau.` });
    return steps;
}

function queensSteps(n) {
    const cols = [];
    const steps = [{ cols: [], bad: -1, msg: `Đặt ${n} hậu trên bàn ${n}×${n}, mỗi hàng một hậu.` }];
    const ok = (r, c) => cols.every((cc, rr) => cc !== c && Math.abs(cc - c) !== r - rr);
    let found = false;
    (function place(r) {
        if (found) return;
        if (r === n) { found = true; steps.push({ cols: [...cols], bad: -1, msg: 'Đã đặt đủ hậu: có nghiệm.' }); return; }
        for (let c = 0; c < n && !found; c++) {
            if (ok(r, c)) {
                cols.push(c);
                steps.push({ cols: [...cols], bad: -1, msg: `Hàng ${r}: đặt hậu ở cột ${c} (an toàn).` });
                place(r + 1);
                if (!found) { cols.pop(); steps.push({ cols: [...cols], bad: -1, msg: `Quay lui khỏi hàng ${r}, cột ${c}.` }); }
            } else {
                steps.push({ cols: [...cols], bad: c, row: r, msg: `Hàng ${r}, cột ${c} bị chiếu, thử cột khác.` });
            }
        }
    })(0);
    return steps;
}

function binaryStringSteps(n) {
    const steps = [];
    const cur = [];
    (function gen(i) {
        if (i === n) { steps.push({ cells: cur.map(String), caption: 'Sinh xong', msg: `Chuỗi: ${cur.join('')}` }); return; }
        for (const b of [0, 1]) {
            cur.push(b);
            steps.push({ cells: [...cur, ...Array(n - cur.length).fill('_')], caption: 'Đang xây', msg: `Chọn bit ${i} = ${b}.` });
            gen(i + 1);
            cur.pop();
        }
    })(0);
    return steps;
}

function mazeSteps() {
    const g = ['S.#.', '..#.', '.#..', '...E'];
    const R = 4, C = 4;
    const path = [];
    const seen = new Set();
    const steps = [];
    const grid = () => g.map((row, r) => [...row].map((ch, c) => (path.some(([a, b]) => a === r && b === c) && ch === '.') ? '*' : ch));
    let done = false;
    (function dfs(r, c) {
        if (done || r < 0 || c < 0 || r >= R || c >= C || g[r][c] === '#' || seen.has(r * C + c)) return;
        seen.add(r * C + c);
        path.push([r, c]);
        steps.push({ grid: grid(), msg: `Đi vào (${r},${c}).` });
        if (g[r][c] === 'E') { done = true; steps.push({ grid: grid(), msg: 'Đã tới đích E.' }); return; }
        for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) dfs(r + dr, c + dc);
        if (!done) { path.pop(); steps.push({ grid: grid(), msg: `Ngõ cụt tại (${r},${c}), quay lui.` }); }
    })(0, 0);
    return steps;
}

function stringMatchSteps(t, p) {
    const steps = [];
    for (let i = 0; i + p.length <= t.length; i++) {
        let j = 0;
        while (j < p.length && t[i + j] === p[j]) j++;
        steps.push({ cells: [...t], hi: Object.fromEntries(Array.from({ length: p.length }, (_, k) => [i + k, k < j ? 'found' : k === j ? 'swap' : 'dim'])), caption: `Mẫu "${p}" đặt tại ${i}`, msg: j === p.length ? `Khớp hoàn toàn tại ${i}.` : `Lệch ở vị trí ${j} của mẫu, dịch sang phải một ô.` });
        if (j === p.length) break;
    }
    return steps;
}

function minmaxSteps(a) {
    const steps = [];
    (function f(l, r) {
        if (l === r) return [a[l], a[l]];
        if (r === l + 1) { const m = [Math.min(a[l], a[r]), Math.max(a[l], a[r])]; steps.push({ cells: a, hi: { [l]: 'active', [r]: 'active' }, msg: `Đoạn [${l},${r}]: min=${m[0]}, max=${m[1]}.` }); return m; }
        const mid = (l + r) >> 1;
        const x = f(l, mid), y = f(mid + 1, r);
        const m = [Math.min(x[0], y[0]), Math.max(x[1], y[1])];
        steps.push({ cells: a, hi: Object.fromEntries(Array.from({ length: r - l + 1 }, (_, k) => [l + k, 'found'])), msg: `Gộp [${l},${r}]: min=${m[0]}, max=${m[1]}.` });
        return m;
    })(0, a.length - 1);
    return steps;
}

function genericSteps(piece) {
    const title = piece.title;
    return [
        { cells: ['Bài toán', 'Chia / thử', 'Kiểm tra', 'Kết quả'], hi: { 0: 'active' }, msg: `${title}: xác định rõ đầu vào, đầu ra và điều kiện dừng trước khi viết code.` },
        { cells: ['Bài toán', 'Chia / thử', 'Kiểm tra', 'Kết quả'], hi: { 1: 'active' }, msg: 'Chia bài toán thành phần nhỏ hơn hoặc thử từng lựa chọn.' },
        { cells: ['Bài toán', 'Chia / thử', 'Kiểm tra', 'Kết quả'], hi: { 2: 'active' }, msg: 'Kiểm tra điều kiện hợp lệ; loại nhánh sai sớm nếu có thể.' },
        { cells: ['Bài toán', 'Chia / thử', 'Kiểm tra', 'Kết quả'], hi: { 3: 'found' }, msg: 'Ghép kết quả các phần lại và trả về.' }
    ];
}

export function mountRecursion(host, piece) {
    const id = piece.id;
    let spec;
    if (id === 'tower-of-hanoi' || id === 'recursion-elimination') {
        spec = { title: 'Tháp Hà Nội', steps: hanoiSteps(3), render: (stage, f) => {
            const row = el('div', { class: 'viz-stack-wrap' });
            for (const k of ['A', 'B', 'C']) {
                const col = el('div', { class: 'viz-stack-col' });
                f.pegs[k].forEach(d => col.append(el('div', { class: 'viz-cell is-active', text: '▬'.repeat(d) + ' ' + d })));
                row.append(el('div', {}, col, el('p', { style: { textAlign: 'center' }, text: `Cột ${k}` })));
            }
            stage.append(row);
        } };
    } else if (id === 'fibonacci' || id === 'recursion' || id === 'decrease-transform-conquer') {
        spec = { title: 'Cây gọi đệ quy fib(4)', steps: fibSteps(4), render: (stage, f) => stage.append(el('pre', { class: 'viz-code-trace', text: f.calls.join('\n') || '(chưa gọi)' })) };
    } else if (id === 'n-queens' || id === 'backtracking' || id === 'hw-trial-error') {
        spec = { title: 'Bài toán 6 quân hậu (quay lui)', steps: queensSteps(6), render: (stage, f) => {
            const n = 6;
            const grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => f.cols[r] === c ? '♛' : (f.row === r && f.bad === c ? '×' : '')));
            renderMatrix(stage, grid, { cellClass: (r, c, v) => v === '♛' ? 'is-path' : v === '×' ? 'is-source' : '' });
        } };
    } else if (id === 'binary-strings') {
        spec = { title: 'Sinh chuỗi nhị phân độ dài 3', steps: binaryStringSteps(3), render: textStage };
    } else if (id === 'maze-stack' || id === 'maze-path-backtracking') {
        spec = { title: 'Tìm đường trong mê cung', steps: mazeSteps(), render: (stage, f) => renderMatrix(stage, f.grid, { cellClass: (r, c, v) => v === '*' ? 'is-path' : v === '#' ? 'is-wall' : v === 'S' || v === 'E' ? 'is-source' : '' }) };
    } else if (id === 'string-matching-bf') {
        spec = { title: 'So khớp chuỗi vét cạn', steps: stringMatchSteps('ABABCABAB', 'ABAB'), render: textStage };
    } else if (id === 'minmax-dc' || id === 'divide-and-conquer') {
        spec = { title: 'Tìm min và max bằng chia để trị', steps: minmaxSteps([7, 2, 9, 4, 1, 8]), render: textStage };
    } else {
        spec = { title: piece.title, steps: genericSteps(piece), render: textStage };
    }
    createStepper(host, { subtitle: piece.summary, ...spec });
}
