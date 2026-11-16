import { createStepper, el, renderCells, renderSvgGraph } from './shared.js';

const SAMPLE_BST_NODES = [
    { id: 1, x: 260, y: 34, label: '50' },
    { id: 2, x: 150, y: 98, label: '30' },
    { id: 3, x: 370, y: 98, label: '70' },
    { id: 4, x: 95, y: 168, label: '20' },
    { id: 5, x: 205, y: 168, label: '40' },
    { id: 6, x: 315, y: 168, label: '60' },
    { id: 7, x: 425, y: 168, label: '80' }
];
const SAMPLE_BST_EDGES = [
    { from: 1, to: 2 }, { from: 1, to: 3 },
    { from: 2, to: 4 }, { from: 2, to: 5 },
    { from: 3, to: 6 }, { from: 3, to: 7 }
];

function paintTree(baseNodes, baseEdges, stateMap = {}, activeId = null) {
    return {
        width: 520,
        height: 215,
        nodes: baseNodes.map(n => ({ ...n, state: n.id === activeId ? 'active' : (stateMap[n.id] || '') })),
        edges: baseEdges.map(e => ({ ...e }))
    };
}

function makeTraversalSteps(mode) {
    const orders = {
        pre: { name: 'Pre-order (NLR)', seq: [1, 2, 4, 5, 3, 6, 7], desc: 'Gốc trước → Cây con trái → Cây con phải. Dùng để sao chép cấu trúc cây.' },
        in: { name: 'In-order (LNR)', seq: [4, 2, 5, 1, 6, 3, 7], desc: 'Trái → Gốc → Phải. Trên BST cho kết quả ĐÃ SẮP XẾP tăng dần!' },
        post: { name: 'Post-order (LRN)', seq: [4, 5, 2, 6, 7, 3, 1], desc: 'Trái → Phải → Gốc cuối. Dùng để giải phóng bộ nhớ hoặc tính biểu thức.' },
        level: { name: 'Level-order (BFS)', seq: [1, 2, 3, 4, 5, 6, 7], desc: 'Dùng Queue duyệt từng tầng từ trên xuống, từ trái sang phải.' }
    };
    const { name, seq, desc } = orders[mode];
    const done = new Set();
    const out = [];
    const steps = [{ mode, done: [], active: null, out: [], msg: `${name}: ${desc}` }];
    for (const id of seq) {
        const val = SAMPLE_BST_NODES.find(n => n.id === id).label;
        out.push(val);
        steps.push({ mode, done: [...done], active: id, out: [...out], msg: `Thăm nút ${val} → Kết quả tạm: [${out.join(', ')}].` });
        done.add(id);
    }
    steps.push({ mode, done: [...done], active: null, out: [...out], msg: `Hoàn tất ${name}: [${out.join(', ')}].` });
    return steps;
}

function makeHeapInsertSteps(heapInit, x) {
    const a = [...heapInit];
    const steps = [{ a: [...a], active: -1, swapPair: null, msg: `Min-Heap ban đầu: [${a.join(', ')}]. Chuẩn bị chèn khóa ${x}.` }];
    a.push(x);
    let i = a.length - 1;
    steps.push({ a: [...a], active: i, swapPair: null, msg: `Đặt ${x} vào cuối mảng (vị trí [${i}]) để giữ cây hoàn chỉnh.` });
    while (i > 0) {
        const p = Math.floor((i - 1) / 2);
        if (a[i] < a[p]) {
            steps.push({ a: [...a], active: i, compare: p, swapPair: [i, p], msg: `Con a[${i}]=${a[i]} < Cha a[${p}]=${a[p]} → cần BƠI LÊN (swim)!` });
            [a[i], a[p]] = [a[p], a[i]];
            i = p;
            steps.push({ a: [...a], active: i, swapPair: null, msg: `Đã đổi chỗ lên vị trí [${i}]. Kiểm tra tiếp với cha mới.` });
        } else {
            steps.push({ a: [...a], active: i, compare: p, swapPair: null, msg: `a[${i}]=${a[i]} >= cha a[${p}]=${a[p]} → Dừng! Tính chất Min-Heap đã thỏa mãn.` });
            break;
        }
    }
    if (i === 0) steps.push({ a: [...a], active: 0, swapPair: null, msg: `${x} đã bơi lên tận gốc [0]! Chèn xong trong O(log n).` });
    return steps;
}

function makeHeapRemoveMinSteps(heapInit) {
    const a = [...heapInit];
    const steps = [{ a: [...a], active: 0, msg: `Min-Heap hiện có min = a[0] = ${a[0]}.` }];
    const minVal = a[0];
    const last = a.pop();
    a[0] = last;
    steps.push({ a: [...a], active: 0, msg: `Lấy min=${minVal} ra, đưa phần tử cuối ${last} lên gốc [0]. Giờ cho ${last} CHÌM XUỐNG (sink).` });
    let i = 0;
    const n = a.length;
    while (2 * i + 1 < n) {
        let smallest = 2 * i + 1;
        if (smallest + 1 < n && a[smallest + 1] < a[smallest]) smallest++;
        if (a[i] <= a[smallest]) {
            steps.push({ a: [...a], active: i, compare: smallest, msg: `a[${i}]=${a[i]} <= con nhỏ nhất a[${smallest}]=${a[smallest]} → Dừng sink!` });
            break;
        }
        steps.push({ a: [...a], active: i, compare: smallest, msg: `Cha a[${i}]=${a[i]} > con nhỏ hơn a[${smallest}]=${a[smallest]} → đổi chỗ với con này.` });
        [a[i], a[smallest]] = [a[smallest], a[i]];
        i = smallest;
        steps.push({ a: [...a], active: i, msg: `Sau hoán đổi, ${a[i]} đang ở [${i}].` });
    }
    steps.push({ a: [...a], active: -1, done: true, msg: `Hoàn tất removeMin() → trả về ${minVal}. Min mới ở gốc là ${a[0]}.` });
    return steps;
}

function renderHeapTreeAndArray(stage, a, active = -1, compare = -1) {
    const coords = [
        [260, 32],
        [150, 92], [370, 92],
        [95, 152], [205, 152], [315, 152], [425, 152],
        [68, 208], [122, 208], [178, 208], [232, 208]
    ];
    const nodes = a.slice(0, coords.length).map((val, i) => ({
        id: i,
        x: coords[i][0],
        y: coords[i][1],
        r: 18,
        label: String(val),
        sub: `[${i}]`,
        state: i === active ? 'active' : i === compare ? 'compare' : ''
    }));
    const edges = [];
    for (let i = 1; i < nodes.length; i++) edges.push({ from: Math.floor((i - 1) / 2), to: i });
    renderSvgGraph(stage, { width: 520, height: 230, nodes, edges });
    const hi = {};
    if (active >= 0) hi[active] = 'active';
    if (compare >= 0) hi[compare] = 'compare';
    renderCells(stage, a.map((v, i) => ({ val: v, sub: `[${i}]` })), hi, 'Biểu diễn bằng mảng 0-based (cha = (i-1)/2, con = 2i+1, 2i+2)');
}

function makeHashSteps(keys, mod, mode) {
    const steps = [{ table: Array.from({ length: mod }, () => []), active: -1, msg: `Bảng băm kích thước M = ${mod}, hàm băm h(k) = k mod ${mod} (${mode === 'linear' ? 'Thăm dò tuyến tính' : 'Dây chuyền Separate Chaining'}).` }];
    if (mode === 'chaining') {
        const t = Array.from({ length: mod }, () => []);
        for (const k of keys) {
            const b = k % mod;
            t[b].push(k);
            steps.push({ table: t.map(arr => [...arr]), active: b, msg: `Chèn ${k}: h(${k}) = ${k} % ${mod} = ${b} → nối vào bucket [${b}].` });
        }
    } else {
        const t = Array.from({ length: mod }, () => []);
        for (const k of keys) {
            let b = k % mod;
            let probes = 0;
            while (t[b].length && probes < mod) { b = (b + 1) % mod; probes++; }
            t[b].push(k);
            steps.push({ table: t.map(arr => [...arr]), active: b, msg: `Chèn ${k}: h(${k}) = ${k % mod}${probes ? ` (đụng độ ${probes} lần → dò sang [${b}])` : ''} → đặt vào ô [${b}].` });
        }
    }
    return steps;
}

export function mountTrees(host, piece) {
    const id = piece.id;

    if (id === 'tree-concepts' || id === 'binary-tree') {
        const steps = [
            { map: { 1: 'active' }, msg: 'Gốc (Root) là 50 ở mức 0 (hoặc độ sâu 0). Không có nút cha.' },
            { map: { 1: 'done', 2: 'active', 3: 'active' }, msg: 'Nút 30 và 70 là hai con trực tiếp của 50 (nút trong — có ít nhất 1 con).' },
            { map: { 4: 'found', 5: 'found', 6: 'found', 7: 'found' }, msg: 'Các nút 20, 40, 60, 80 không có con gọi là Nút Lá (Leaf). Chiều cao cây đếm theo cạnh = 2.' }
        ];
        createStepper(host, {
            title: id === 'binary-tree' ? 'Cây nhị phân (tối đa 2 con: left & right)' : 'Thuật ngữ cơ bản trên Cây (Root, Internal, Leaf, Height)',
            subtitle: 'Trong cây có n nút luôn có đúng n - 1 cạnh nối.',
            steps,
            render: (stage, f) => renderSvgGraph(stage, paintTree(SAMPLE_BST_NODES, SAMPLE_BST_EDGES, f.map))
        });
        return;
    }

    if (id === 'binary-tree-repr') {
        const arr = ['-', '50', '30', '70', '20', '40', '60', '80'];
        const steps = [
            { idx: 1, msg: 'Biểu diễn mảng 1-based tiện cho cây gần đầy: đặt gốc tại [1] = 50.' },
            { idx: 2, msg: 'Từ chỉ số i = 1: con trái = 2*i = [2] (30), con phải = 2*i+1 = [3] (70).' },
            { idx: 5, msg: 'Từ nút con i = 5 (40): cha của nó luôn là i / 2 = [2] (30). Nếu dùng con trỏ LinkedNode, mỗi nút cần {val, left, right}.' }
        ];
        createStepper(host, {
            title: 'Biểu diễn Cây nhị phân: Liên kết Node vs Mảng 1-based',
            subtitle: 'Mảng tránh tốn con trỏ nếu cây đầy; Node linh hoạt khi cây lệch/thưa.',
            steps,
            render: (stage, f) => {
                renderSvgGraph(stage, paintTree(SAMPLE_BST_NODES, SAMPLE_BST_EDGES, {}, f.idx));
                renderCells(stage, arr.map((v, i) => ({ val: v, sub: `[${i}]` })), { [f.idx]: 'active' }, 'Mảng 1-based tương ứng (chỉ số 0 bỏ trống)');
            }
        });
        return;
    }

    if (id === 'tree-traversal') {
        createStepper(host, {
            title: '4 phép duyệt Cây nhị phân',
            subtitle: 'Chọn kiểu duyệt để thấy thứ tự thăm từng nút.',
            presets: [
                { label: 'In-order (LNR)', steps: () => makeTraversalSteps('in') },
                { label: 'Pre-order (NLR)', steps: () => makeTraversalSteps('pre') },
                { label: 'Post-order (LRN)', steps: () => makeTraversalSteps('post') },
                { label: 'Level-order (BFS)', steps: () => makeTraversalSteps('level') }
            ],
            steps: makeTraversalSteps('in'),
            render: (stage, f) => {
                const state = {};
                f.done.forEach(nid => { state[nid] = 'done'; });
                renderSvgGraph(stage, paintTree(SAMPLE_BST_NODES, SAMPLE_BST_EDGES, state, f.active));
                stage.append(el('p', { style: { textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '600', marginTop: '8px' }, text: `Thứ tự in ra: [ ${f.out.join(' → ')} ]` }));
            }
        });
        return;
    }

    if (id === 'expression-tree') {
        const nodes = [
            { id: 1, x: 260, y: 34, label: '*', sub: '42' },
            { id: 2, x: 150, y: 100, label: '+', sub: '7' },
            { id: 3, x: 370, y: 100, label: '-', sub: '6' },
            { id: 4, x: 95, y: 170, label: '3' },
            { id: 5, x: 205, y: 170, label: '4' },
            { id: 6, x: 315, y: 170, label: '8' },
            { id: 7, x: 425, y: 170, label: '2' }
        ];
        const edges = [{ from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 }, { from: 3, to: 6 }, { from: 3, to: 7 }];
        const steps = [
            { map: { 4: 'done', 5: 'done' }, active: 2, msg: 'Duyệt hậu thứ tự (Post-order) từ lá lên: tính nhánh trái (+) = 3 + 4 = 7.' },
            { map: { 4: 'done', 5: 'done', 2: 'done', 6: 'done', 7: 'done' }, active: 3, msg: 'Tính nhánh phải (-) = 8 - 2 = 6.' },
            { map: { 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done', 7: 'done' }, active: 1, msg: 'Lên gốc (*): kết quả = 7 * 6 = 42. Duyệt In-order cho trung tố (3+4)*(8-2).' }
        ];
        createStepper(host, {
            title: 'Cây biểu thức (Expression Tree) cho (3 + 4) * (8 - 2)',
            subtitle: 'Lá là toán hạng, nút trong là toán tử. Tính từ dưới lên theo Post-order.',
            steps,
            render: (stage, f) => renderSvgGraph(stage, {
                width: 520,
                height: 215,
                nodes: nodes.map(n => ({ ...n, state: n.id === f.active ? 'active' : (f.map[n.id] || '') })),
                edges
            })
        });
        return;
    }

    if (id === 'priority-queue-adt' || id === 'binary-heap' || id === 'hw-priority-queue') {
        const heap = [10, 20, 15, 35, 30, 25, 40];
        const steps = [
            { a: heap, active: 0, msg: 'Min-Heap: mọi nút cha đều ≤ cả 2 con → giá trị NHỎ NHẤT (10) luôn nằm ở gốc [0].' },
            { a: heap, active: 1, compare: 3, msg: 'Kiểm tra nút [1]=20: hai con tại 2*1+1=[3] (35) và 2*1+2=[4] (30) đều ≥ 20.' },
            { a: heap, active: 2, compare: 5, msg: 'Nhánh bên kia [2]=15 ≤ [5]=25 và [6]=40. Chú ý anh em cùng tầng (20 và 15) không bắt buộc sắp xếp.' }
        ];
        createStepper(host, {
            title: id === 'priority-queue-adt' ? 'Priority Queue ADT (Lấy phần tử ưu tiên nhất O(log n))' : id === 'hw-priority-queue' ? 'Thực hành Heap & Priority Queue' : 'Cấu trúc Binary Min-Heap & Lưu trữ bằng mảng',
            subtitle: 'Luôn là cây nhị phân hoàn chỉnh, lưu gọn trong mảng không cần con trỏ left/right.',
            steps,
            render: (stage, f) => renderHeapTreeAndArray(stage, f.a, f.active, f.compare)
        });
        return;
    }

    if (id === 'heap-insert') {
        const base = [10, 20, 15, 35, 30, 25, 40];
        let val = 12;
        const inp = el('input', { type: 'number', value: String(val), style: { width: '70px' }, 'aria-label': 'Khóa cần chèn vào Min-Heap' });
        const btn = el('button', { type: 'button', class: 'viz-btn', text: 'Chèn & Bơi lên' });
        const stepper = createStepper(host, {
            title: 'Min-Heap Insert (Chèn vào cuối rồi Swim O(log n))',
            subtitle: 'Nhét phần tử mới vào cuối mảng rồi đẩy dần lên qua cha cho đến khi thỏa mãn cha ≤ con.',
            controlsNode: el('span', { style: { display: 'inline-flex', gap: '8px', alignItems: 'center' } }, el('label', {}, 'Khóa mới:', inp), btn),
            steps: makeHeapInsertSteps(base, val),
            render: (stage, f) => renderHeapTreeAndArray(stage, f.a, f.active, f.compare)
        });
        btn.addEventListener('click', () => stepper.update(makeHeapInsertSteps(base, Number(inp.value) || 5)));
        return;
    }

    if (id === 'heap-removemin') {
        const base = [10, 20, 15, 35, 30, 25, 40];
        createStepper(host, {
            title: 'Min-Heap removeMin() (Rút gốc rồi Sink O(log n))',
            subtitle: 'Đưa phần tử cuối lên gốc rồi cho chìm xuống bằng cách đổi chỗ với con NHỎ HƠN.',
            steps: makeHeapRemoveMinSteps(base),
            render: (stage, f) => renderHeapTreeAndArray(stage, f.a, f.active, f.compare)
        });
        return;
    }

    if (id === 'bst-property' || id === 'bst-operations' || id === 'bst-geometric-apps' || id === 'hw-bst') {
        const isRange = id === 'bst-geometric-apps';
        let target = 40;
        const makeSearch = x => {
            const steps = [{ active: 1, done: {}, msg: `Tìm kiếm ${x} bắt đầu từ gốc 50 (tính chất BST: nhỏ hơn rẽ trái, lớn hơn rẽ phải).` }];
            const path = [{ id: 1, v: 50 }, { id: x < 50 ? 2 : 3, v: x < 50 ? 30 : 70 }];
            const last = x === 50 ? null : x < 50 ? (x < 30 ? { id: 4, v: 20 } : { id: 5, v: 40 }) : (x < 70 ? { id: 6, v: 60 } : { id: 7, v: 80 });
            if (x === 50) return [{ active: 1, done: { 1: 'done' }, msg: 'So sánh tại gốc 50 == 50 → Tìm thấy ngay ở bước đầu tiên!' }];
            steps.push({ active: path[1].id, done: { 1: 'compare' }, msg: `Vì ${x} ${x < 50 ? '<' : '>'} 50 nên rẽ sang cây con ${x < 50 ? 'trái (30)' : 'phải (70)'}, bỏ qua nửa còn lại.` });
            if (last) {
                const hit = last.v === x;
                steps.push({ active: last.id, done: { 1: 'compare', [path[1].id]: 'compare', [last.id]: hit ? 'done' : 'warn' }, msg: hit ? `Tại nút ${last.v}: khớp ${x}! Tìm thấy sau đúng ${3} lần so sánh.` : `So sánh tại lá ${last.v} ≠ ${x} → nhánh null, không tồn tại ${x}.` });
            }
            return steps;
        };
        const steps = isRange
            ? [
                { active: 1, done: {}, msg: 'Truy vấn đoạn [25..65] trên BST (dùng trong tìm giao đoạn thẳng quét Sweep-Line).' },
                { active: 2, done: { 1: 'done' }, msg: '50 nằm trong [25..65]: xét cả trái (30 >= 25) và phải (70 > 65 nhưng nhánh trái của 70 vẫn có thể ≤ 65).' },
                { active: 5, done: { 1: 'done', 2: 'done', 6: 'done' }, msg: 'Kết quả trong đoạn [25..65]: {30, 40, 50, 60} — cắt tỉa toàn bộ nhánh 20 và 80.' }
            ]
            : makeSearch(target);
        const inp = !isRange ? el('input', { type: 'number', value: '40', style: { width: '70px' }, 'aria-label': 'Khóa tìm trong BST' }) : null;
        const btn = !isRange ? el('button', { type: 'button', class: 'viz-btn', text: 'Tìm trên BST' }) : null;
        const stepper = createStepper(host, {
            title: isRange ? 'Tìm kiếm theo khoảng [lo..hi] trên BST' : 'Cây tìm kiếm nhị phân (BST): Rẽ nhánh O(h)',
            subtitle: isRange ? 'Tỉa nhánh ngoài khoảng giúp trả lời các bài toán quét hình học 1D/2D.' : 'Mọi nút nhánh trái < gốc < mọi nút nhánh phải.',
            controlsNode: !isRange ? el('span', { style: { display: 'inline-flex', gap: '8px', alignItems: 'center' } }, el('label', {}, 'Tìm khóa:', inp), btn) : null,
            steps,
            render: (stage, f) => renderSvgGraph(stage, paintTree(SAMPLE_BST_NODES, SAMPLE_BST_EDGES, f.done, f.active))
        });
        if (btn) btn.addEventListener('click', () => stepper.update(makeSearch(Number(inp.value) || 40)));
        return;
    }

    if (id === 'bst-balance') {
        const balanced = [
            { id: 1, x: 140, y: 32, label: '4' },
            { id: 2, x: 85, y: 92, label: '2' }, { id: 3, x: 195, y: 92, label: '6' },
            { id: 4, x: 55, y: 152, label: '1' }, { id: 5, x: 115, y: 152, label: '3' },
            { id: 6, x: 165, y: 152, label: '5' }, { id: 7, x: 225, y: 152, label: '7' }
        ];
        const skewed = [
            { id: 1, x: 350, y: 26, label: '1' },
            { id: 2, x: 380, y: 60, label: '2' },
            { id: 3, x: 410, y: 94, label: '3' },
            { id: 4, x: 440, y: 128, label: '4' },
            { id: 5, x: 470, y: 162, label: '5' },
            { id: 6, x: 500, y: 196, label: '6' }
        ];
        const steps = [
            { focus: 'balanced', msg: 'Cùng tập dữ liệu {1..7}: chèn theo thứ tự giữa trước (4,2,6,1,3,5,7) tạo cây CÂN BẰNG chiều cao O(log n).' },
            { focus: 'skewed', msg: 'Chèn theo thứ tự ĐÃ SẮP (1,2,3,4,5,6...) khiến BST suy biến thành danh sách liên kết cao O(n)! Đây là lý do cần cây AVL / Đỏ-Đen tự xoay cân bằng.' }
        ];
        createStepper(host, {
            title: 'BST Cân bằng O(log n) vs Suy biến O(n)',
            subtitle: 'Thứ tự chèn quyết định hình dáng BST nếu không có phép xoay tự cân bằng.',
            steps,
            render: (stage, f) => {
                const nodes = [...balanced.map(n => ({ ...n, state: f.focus === 'balanced' ? 'done' : '' })), ...skewed.map(n => ({ ...n, id: 100 + n.id, state: f.focus === 'skewed' ? 'warn' : '' }))];
                const edges = [
                    ...SAMPLE_BST_EDGES,
                    { from: 101, to: 102 }, { from: 102, to: 103 }, { from: 103, to: 104 }, { from: 104, to: 105 }, { from: 105, to: 106 }
                ];
                renderSvgGraph(stage, { width: 550, height: 220, nodes, edges });
            }
        });
        return;
    }

    // hash-table
    const keys = [14, 21, 7, 15, 29, 36];
    const mod = 7;
    createStepper(host, {
        title: 'Bảng băm (Hash Table) & Xử lý đụng độ (M = 7)',
        subtitle: 'Chuyển giữa Separate Chaining (danh sách ở mỗi ô) và Linear Probing (dò ô kế tiếp).',
        presets: [
            { label: 'Dây chuyền (Separate Chaining)', steps: () => makeHashSteps(keys, mod, 'chaining') },
            { label: 'Dò tuyến tính (Linear Probing)', steps: () => makeHashSteps(keys, mod, 'linear') }
        ],
        steps: makeHashSteps(keys, mod, 'chaining'),
        render: (stage, f) => {
            renderCells(stage, f.table.map((bucket, i) => ({
                val: bucket.length ? bucket.join(' → ') : '∅',
                sub: `bucket [${i}]`
            })), f.active >= 0 ? { [f.active]: 'active' } : {}, `Dữ liệu chèn lần lượt: ${keys.join(', ')}`);
        }
    });
}
