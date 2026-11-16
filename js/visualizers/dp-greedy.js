import { createStepper, el, renderCells, renderMatrix } from './shared.js';

function coinSteps(coins, amount) {
    const steps = [];
    let left = amount;
    const used = [];
    steps.push({ cells: [left], caption: 'Còn lại', msg: `Đổi ${amount} bằng đồng lớn nhất còn vừa.` });
    for (const c of [...coins].sort((a, b) => b - a)) {
        while (left >= c) { left -= c; used.push(c); steps.push({ cells: [...used, '|', left], caption: 'Đã lấy | còn lại', msg: `Lấy ${c}, còn ${left}.` }); }
    }
    steps.push({ cells: used, caption: left ? `Không đổi hết, dư ${left}` : 'Xong', msg: left ? 'Tham lam thất bại.' : `Dùng ${used.length} đồng.` });
    return steps;
}

function lcsSteps(a, b) {
    const m = a.length, n = b.length;
    const t = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const steps = [];
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
        t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1]);
        steps.push({ t: t.map(r => [...r]), i, j, msg: a[i - 1] === b[j - 1] ? `Hai ký tự '${a[i - 1]}' giống nhau: lấy chéo + 1 = ${t[i][j]}.` : `Khác nhau: lấy max(trên, trái) = ${t[i][j]}.` });
    }
    return { steps, a, b };
}

function knapsackSteps() {
    const w = [1, 3, 4, 5], v = [1, 4, 5, 7], W = 7;
    const t = Array.from({ length: w.length + 1 }, () => Array(W + 1).fill(0));
    const steps = [];
    for (let i = 1; i <= w.length; i++) for (let c = 0; c <= W; c++) {
        t[i][c] = t[i - 1][c];
        if (c >= w[i - 1]) t[i][c] = Math.max(t[i][c], t[i - 1][c - w[i - 1]] + v[i - 1]);
        steps.push({ t: t.map(r => [...r]), i, j: c, msg: `Vật ${i} (nặng ${w[i - 1]}, giá ${v[i - 1]}), sức chứa ${c}: tốt nhất = ${t[i][c]}.` });
    }
    return steps;
}

function lisSteps(a) {
    const L = a.map(() => 1);
    const steps = [{ L: [...L], i: 0, msg: 'L[i] = độ dài dãy con tăng dài nhất kết thúc tại i, khởi tạo 1.' }];
    for (let i = 1; i < a.length; i++) {
        for (let j = 0; j < i; j++) if (a[j] < a[i]) L[i] = Math.max(L[i], L[j] + 1);
        steps.push({ L: [...L], i, msg: `L[${i}] = ${L[i]} (xét mọi j < ${i} có a[j] < ${a[i]}).` });
    }
    return steps;
}

function activitySteps() {
    const acts = [[1, 4], [3, 5], [0, 6], [5, 7], [8, 9], [5, 9]].sort((x, y) => x[1] - y[1]);
    let end = -1;
    const pick = [];
    const steps = [{ cells: acts.map(a => `${a[0]}-${a[1]}`), hi: {}, msg: 'Sắp xếp theo giờ kết thúc tăng dần.' }];
    acts.forEach((a, i) => {
        const ok = a[0] >= end;
        if (ok) { pick.push(i); end = a[1]; }
        steps.push({ cells: acts.map(x => `${x[0]}-${x[1]}`), hi: Object.fromEntries([...pick.map(p => [p, 'found']), [i, ok ? 'found' : 'swap']]), msg: ok ? `Chọn ${a[0]}-${a[1]}.` : `Bỏ ${a[0]}-${a[1]} vì trùng giờ.` });
    });
    return steps;
}

function tableStage(stage, f) {
    renderMatrix(stage, f.t, { cellClass: (r, c) => r === f.i && c === f.j ? 'is-active' : '' });
}

export function mountDpGreedy(host, piece) {
    const id = piece.id;
    let spec;
    if (id === 'coin-change-greedy' || id === 'greedy-method' || id === 'hw-greedy') {
        spec = { title: 'Đổi tiền tham lam', presets: [
            { label: '{25,10,5,1} đổi 63', steps: () => coinSteps([25, 10, 5, 1], 63) },
            { label: '{10,6,1} đổi 12 (sai)', steps: () => coinSteps([10, 6, 1], 12) }
        ], steps: coinSteps([25, 10, 5, 1], 63), render: (s, f) => renderCells(s, f.cells, {}, f.caption) };
    } else if (id === 'activity-selection') {
        spec = { title: 'Chọn hoạt động', steps: activitySteps(), render: (s, f) => renderCells(s, f.cells, f.hi) };
    } else if (id === 'lcs') {
        const r = lcsSteps('ABCBDAB', 'BDCABA');
        spec = { title: 'LCS: ABCBDAB và BDCABA', steps: r.steps, render: (s, f) => renderMatrix(s, f.t, { cellClass: (x, y) => x === f.i && y === f.j ? 'is-active' : '' }) };
    } else if (id === 'knapsack-01') {
        spec = { title: 'Cái túi 0/1, sức chứa 7', steps: knapsackSteps(), render: tableStage };
    } else if (id === 'lis') {
        const a = [5, 2, 8, 6, 3, 6, 9, 7];
        spec = { title: 'Dãy con tăng dài nhất', steps: lisSteps(a), render: (s, f) => { renderCells(s, a, { [f.i]: 'active' }, 'Dãy a'); renderCells(s, f.L, { [f.i]: 'found' }, 'L[i]'); } };
    } else if (id === 'binomial-dp' || id === 'grid-path-dp') {
        const n = 6;
        const t = Array.from({ length: n }, () => Array(n).fill(1));
        const steps = [{ t: t.map(r => [...r]), i: 0, j: 0, msg: 'Biên bằng 1.' }];
        for (let i = 1; i < n; i++) for (let j = 1; j < n; j++) { t[i][j] = t[i - 1][j] + t[i][j - 1]; steps.push({ t: t.map(r => [...r]), i, j, msg: `t[${i}][${j}] = trên + trái = ${t[i][j]}.` }); }
        spec = { title: 'Bảng quy hoạch động tổng hai ô trước', steps, render: tableStage };
    } else {
        spec = { title: piece.title, steps: [
            { cells: ['Bài toán lớn', 'Bài toán con', 'Bảng nhớ', 'Đáp án'], hi: { 0: 'active' }, msg: 'Chia bài toán thành các bài toán con chồng lấn.' },
            { cells: ['Bài toán lớn', 'Bài toán con', 'Bảng nhớ', 'Đáp án'], hi: { 2: 'active' }, msg: 'Lưu kết quả bài toán con vào bảng để không tính lại.' },
            { cells: ['Bài toán lớn', 'Bài toán con', 'Bảng nhớ', 'Đáp án'], hi: { 3: 'found' }, msg: 'Đọc đáp án từ ô cuối của bảng.' }
        ], render: (s, f) => renderCells(s, f.cells, f.hi) };
    }
    createStepper(host, { subtitle: piece.summary, ...spec });
}
