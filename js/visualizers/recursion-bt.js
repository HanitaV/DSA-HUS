import { createStepper, el, renderCells, renderMatrix, svgEl } from './shared.js';

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

function factorialCallStackSteps(n = 4) {
    const steps = [];
    const stack = [];
    const snap = () => stack.map(item => ({ ...item }));
    steps.push({ stack: [], line: 0, msg: `Bắt đầu gọi fact(${n}): mỗi lời gọi đẩy 1 khung mới vào ngăn xếp (Call Stack).` });

    function solve(k) {
        stack.push({ call: `fact(${k})`, note: k <= 1 ? 'Cơ sở → trả 1' : `Chờ ${k} × fact(${k - 1})`, state: k <= 1 ? 'base' : 'wait' });
        steps.push({
            stack: snap(),
            line: k <= 1 ? 1 : 2,
            msg: k <= 1
                ? `Gặp điểm dừng (Base Case): fact(${k}) trả về 1 ngay lập tức.`
                : `Đẩy fact(${k}) vào stack, tạm dừng để tính fact(${k - 1}).`
        });
        if (k <= 1) {
            stack.pop();
            return 1;
        }
        const sub = solve(k - 1);
        const res = k * sub;
        stack[stack.length - 1] = { call: `fact(${k})`, note: `${k} × ${sub} = ${res}`, state: 'ret' };
        steps.push({
            stack: snap(),
            line: 2,
            msg: `Nhận fact(${k - 1}) = ${sub} → tính ${k} × ${sub} = ${res} và trả lên tầng trên.`
        });
        stack.pop();
        return res;
    }

    const ans = solve(n);
    steps.push({ stack: [], line: 3, msg: `Ngăn xếp rỗng! Kết quả cuối cùng: fact(${n}) = ${ans}.` });
    return steps;
}

function sumCallStackSteps(n = 4) {
    const steps = [];
    const stack = [];
    const snap = () => stack.map(item => ({ ...item }));
    steps.push({ stack: [], line: 0, msg: `Tính tổng 1 + 2 + ... + ${n} bằng đệ quy.` });

    function solve(k) {
        stack.push({ call: `sum(${k})`, note: k <= 1 ? 'Cơ sở → trả 1' : `Chờ ${k} + sum(${k - 1})`, state: k <= 1 ? 'base' : 'wait' });
        steps.push({
            stack: snap(),
            line: k <= 1 ? 1 : 2,
            msg: k <= 1 ? `Điểm dừng: sum(${k}) = 1.` : `Đẩy sum(${k}) vào stack, gọi tiếp sum(${k - 1}).`
        });
        if (k <= 1) { stack.pop(); return 1; }
        const sub = solve(k - 1);
        const res = k + sub;
        stack[stack.length - 1] = { call: `sum(${k})`, note: `${k} + ${sub} = ${res}`, state: 'ret' };
        steps.push({
            stack: snap(),
            line: 2,
            msg: `Nhận sum(${k - 1}) = ${sub} → trả về ${k} + ${sub} = ${res}.`
        });
        stack.pop();
        return res;
    }

    const ans = solve(n);
    steps.push({ stack: [], line: 3, msg: `Hoàn tất! sum(${n}) = ${ans}.` });
    return steps;
}

function renderCallStack(stage, f) {
    const wrap = el('div', { class: 'viz-callstack-wrap' });
    if (!f.stack.length) {
        wrap.append(el('div', { class: 'viz-callstack-empty', text: 'Ngăn xếp lời gọi (Call Stack) đang rỗng' }));
    } else {
        const list = el('div', { class: 'viz-callstack' });
        [...f.stack].reverse().forEach((item, idx) => {
            const isTop = idx === 0;
            const cls = `viz-frame ${item.state === 'base' ? 'is-base' : item.state === 'ret' ? 'is-ret' : isTop ? 'is-top' : ''}`;
            list.append(
                el('div', { class: cls },
                    el('strong', { text: item.call }),
                    el('span', { text: item.note })
                )
            );
        });
        wrap.append(el('div', { class: 'viz-callstack-label', text: 'Đỉnh Stack (đang chạy ở trên cùng)' }), list);
    }
    stage.append(wrap);
}

function buildFibTree(n, useMemo) {
    let nextId = 0;
    const nodes = [];
    const seen = new Set();
    const memo = new Map();
    const steps = [];

    function build(k, depth, xMin, xMax, parentId) {
        const id = nextId++;
        const x = (xMin + xMax) / 2;
        const y = 34 + depth * 56;
        const isRepeat = seen.has(k);
        seen.add(k);
        const node = { id, k, x, y, parentId, val: null, status: 'pending', isRepeat };
        nodes.push(node);

        if (useMemo && memo.has(k)) {
            node.status = 'cached';
            node.val = memo.get(k);
            steps.push({
                nodes: nodes.map(n0 => ({ ...n0 })),
                activeId: id,
                calls: nodes.length,
                msg: `Gặp lại fib(${k}) — lấy ngay kết quả ${node.val} từ bảng nhớ (không gọi đệ quy tiếp)!`
            });
            return node.val;
        }

        node.status = 'active';
        steps.push({
            nodes: nodes.map(n0 => ({ ...n0 })),
            activeId: id,
            calls: nodes.length,
            msg: k <= 1
                ? `fib(${k}): trường hợp cơ sở, trả về ${k}.`
                : isRepeat
                    ? `Gọi lại fib(${k}) lần nữa (trùng bài toán con đã tính trước đó!).`
                    : `Gọi fib(${k}) → tách thành fib(${k - 1}) + fib(${k - 2}).`
        });

        let val;
        if (k <= 1) {
            val = k;
        } else {
            const left = build(k - 1, depth + 1, xMin, x, id);
            const right = build(k - 2, depth + 1, x, xMax, id);
            val = left + right;
        }
        node.val = val;
        node.status = 'done';
        if (useMemo) memo.set(k, val);
        steps.push({
            nodes: nodes.map(n0 => ({ ...n0 })),
            activeId: id,
            calls: nodes.length,
            msg: `fib(${k}) = ${val}.`
        });
        return val;
    }

    build(n, 0, 16, 504, null);
    return steps;
}

function renderFibTree(stage, f) {
    const W = 520, H = 290;
    const svg = svgEl('svg', { class: 'viz-svg viz-tree-svg', viewBox: `0 0 ${W} ${H}` });
    const byId = new Map(f.nodes.map(n => [n.id, n]));

    f.nodes.forEach(n => {
        if (n.parentId == null) return;
        const p = byId.get(n.parentId);
        svg.append(svgEl('line', {
            x1: p.x, y1: p.y + 18, x2: n.x, y2: n.y - 18,
            stroke: n.id === f.activeId ? '#1f2de6' : '#cbd5e1',
            'stroke-width': n.id === f.activeId ? 2.5 : 1.5
        }));
    });

    f.nodes.forEach(n => {
        const isCurrent = n.id === f.activeId;
        const fill = n.status === 'cached'
            ? '#dcfce7'
            : isCurrent
                ? '#1f2de6'
                : n.isRepeat
                    ? '#fef3c7'
                    : n.status === 'done'
                        ? '#eef2ff'
                        : '#fff';
        const stroke = n.status === 'cached'
            ? '#20694b'
            : isCurrent
                ? '#1f2de6'
                : n.isRepeat
                    ? '#d97706'
                    : '#94a3b8';
        const textColor = isCurrent ? '#fff' : '#0b0c0e';

        svg.append(svgEl('rect', {
            x: n.x - 27, y: n.y - 18, width: 54, height: 36, rx: 8,
            fill, stroke, 'stroke-width': isCurrent ? 2.5 : 1.5
        }));
        svg.append(svgEl('text', {
            x: n.x, y: n.y - 2, 'text-anchor': 'middle',
            fill: textColor, 'font-size': 11, 'font-weight': 600
        }, `f(${n.k})`));
        svg.append(svgEl('text', {
            x: n.x, y: n.y + 12, 'text-anchor': 'middle',
            fill: isCurrent ? '#dbeafe' : '#475569', 'font-size': 10.5
        }, n.val != null ? `= ${n.val}` : '...'));
    });

    stage.append(svg);
}

function fastPowerSteps(base = 2, exp = 6) {
    const steps = [];
    const trace = [];
    function pow(a, n) {
        trace.push(`pow(${a}, ${n})`);
        if (n === 0) {
            steps.push({ cells: [...trace], msg: 'n = 0 → trả về 1.' });
            return 1;
        }
        if (n === 1) {
            steps.push({ cells: [...trace], hi: { [trace.length - 1]: 'found' }, msg: `n = 1 → cơ sở trả về ${a}.` });
            return a;
        }
        steps.push({ cells: [...trace], hi: { [trace.length - 1]: 'active' }, msg: `Giảm cỡ bài toán một nửa: tính pow(${a}, ${Math.floor(n / 2)}).` });
        const half = pow(a, Math.floor(n / 2));
        const res = n % 2 === 0 ? half * half : half * half * a;
        steps.push({
            cells: [...trace, `= ${res}`],
            hi: { [trace.length]: 'found' },
            msg: n % 2 === 0
                ? `n = ${n} chẵn: bình phương ${half} × ${half} = ${res}.`
                : `n = ${n} lẻ: ${half} × ${half} × ${a} = ${res}.`
        });
        return res;
    }
    pow(base, exp);
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
    } else if (id === 'recursion') {
        spec = {
            title: 'Ngăn xếp lời gọi (Call Stack) khi chạy đệ quy',
            codeLines: [
                'int fact(int n) {',
                '    if (n <= 1) return 1;       // Điểm dừng',
                '    return n * fact(n - 1);   // Gọi xuống & chờ trả về',
                '}'
            ],
            presets: [
                { label: 'Giai thừa fact(4)', steps: () => factorialCallStackSteps(4) },
                { label: 'Tổng 1..n: sum(4)', steps: () => sumCallStackSteps(4) }
            ],
            steps: factorialCallStackSteps(4),
            stats: f => [['Độ sâu Stack', f.stack.length]],
            render: renderCallStack
        };
    } else if (id === 'fibonacci') {
        spec = {
            title: 'Cây đệ quy fib(4): đệ quy thuần vs có ghi nhớ (Memo)',
            presets: [
                { label: 'Đệ quy thuần (lặp lại)', steps: () => buildFibTree(4, false) },
                { label: 'Có ghi nhớ (Memo)', steps: () => buildFibTree(4, true) }
            ],
            steps: buildFibTree(4, false),
            stats: f => [['Số nút đã gọi', f.calls]],
            render: renderFibTree
        };
    } else if (id === 'decrease-transform-conquer') {
        spec = {
            title: 'Giảm để trị: Lũy thừa nhanh 2^6 (giảm n một nửa mỗi bước)',
            steps: fastPowerSteps(2, 6),
            render: (s, f) => renderCells(s, f.cells, f.hi || {}, 'Chuỗi thu gọn kích thước')
        };
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
