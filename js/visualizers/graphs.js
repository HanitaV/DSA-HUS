import { createStepper, el, renderCells, renderMatrix, renderSvgGraph } from './shared.js';

const G_NODES = [
    { id: 'A', x: 85, y: 120 },
    { id: 'B', x: 205, y: 46 },
    { id: 'C', x: 205, y: 194 },
    { id: 'D', x: 345, y: 46 },
    { id: 'E', x: 345, y: 194 },
    { id: 'F', x: 470, y: 120 }
];

const G_EDGES = [
    { from: 'A', to: 'B', w: 4 },
    { from: 'A', to: 'C', w: 2 },
    { from: 'B', to: 'C', w: 1 },
    { from: 'B', to: 'D', w: 5 },
    { from: 'C', to: 'E', w: 8 },
    { from: 'C', to: 'D', w: 6 },
    { from: 'D', to: 'E', w: 2 },
    { from: 'D', to: 'F', w: 6 },
    { from: 'E', to: 'F', w: 3 }
];

function paintGraph(nodeStates = {}, edgeStates = {}, nodeSubs = {}, directed = false) {
    return {
        width: 560,
        height: 240,
        directed,
        nodes: G_NODES.map(n => ({ ...n, label: n.id, sub: nodeSubs[n.id] || '', state: nodeStates[n.id] || '' })),
        edges: G_EDGES.map(e => {
            const key = `${e.from}-${e.to}`;
            const rev = `${e.to}-${e.from}`;
            return { from: e.from, to: e.to, label: e.w, state: edgeStates[key] || edgeStates[rev] || '' };
        })
    };
}

function makeDfsSteps() {
    return [
        { ns: { A: 'active' }, es: {}, ds: 'Stack: [A]', order: [], msg: 'Bắt đầu DFS từ đỉnh A. Đẩy A vào Stack.' },
        { ns: { A: 'done', B: 'active' }, es: { 'A-B': 'active' }, ds: 'Stack: [A, B]', order: ['A'], msg: 'Thăm A, đi sâu sang kề đầu tiên là B.' },
        { ns: { A: 'done', B: 'done', C: 'active' }, es: { 'A-B': 'done', 'B-C': 'active' }, ds: 'Stack: [A, B, C]', order: ['A', 'B'], msg: 'Từ B đi sâu tiếp sang C.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'active' }, es: { 'A-B': 'done', 'B-C': 'done', 'C-D': 'active' }, ds: 'Stack: [A, B, C, D]', order: ['A', 'B', 'C'], msg: 'Từ C bỏ qua A (đã thăm), đi sâu sang D.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'active' }, es: { 'A-B': 'done', 'B-C': 'done', 'C-D': 'done', 'D-E': 'active' }, ds: 'Stack: [A, B, C, D, E]', order: ['A', 'B', 'C', 'D'], msg: 'Từ D đi sâu sang E.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'done', F: 'active' }, es: { 'A-B': 'done', 'B-C': 'done', 'C-D': 'done', 'D-E': 'done', 'E-F': 'active' }, ds: 'Stack: [A, B, C, D, E, F]', order: ['A', 'B', 'C', 'D', 'E'], msg: 'Từ E đi sâu tới F.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'done', F: 'done' }, es: { 'A-B': 'done', 'B-C': 'done', 'C-D': 'done', 'D-E': 'done', 'E-F': 'done' }, ds: 'Stack: []', order: ['A', 'B', 'C', 'D', 'E', 'F'], msg: 'Không còn đỉnh chưa thăm → quay lui sạch Stack! Thứ tự DFS: A→B→C→D→E→F.' }
    ];
}

function makeBfsSteps() {
    return [
        { ns: { A: 'active' }, es: {}, subs: { A: 'd=0' }, ds: 'Queue: [A]', order: ['A'], msg: 'Khởi tạo BFS từ A (dist=0), đưa A vào Queue.' },
        { ns: { A: 'done', B: 'active', C: 'active' }, es: { 'A-B': 'active', 'A-C': 'active' }, subs: { A: 'd=0', B: 'd=1', C: 'd=1' }, ds: 'Queue: [B, C]', order: ['A', 'B', 'C'], msg: 'Lấy A: mở rộng các đỉnh kề cách 1 cạnh → B, C (d=1).' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'active', E: 'active' }, es: { 'A-B': 'done', 'A-C': 'done', 'B-D': 'active', 'C-E': 'active' }, subs: { A: 'd=0', B: 'd=1', C: 'd=1', D: 'd=2', E: 'd=2' }, ds: 'Queue: [D, E]', order: ['A', 'B', 'C', 'D', 'E'], msg: 'Lấy B rồi C: khám phá tầng tiếp theo cách 2 cạnh → D, E (d=2).' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'done', F: 'done' }, es: { 'A-B': 'done', 'A-C': 'done', 'B-D': 'done', 'C-E': 'done', 'D-F': 'done' }, subs: { A: 'd=0', B: 'd=1', C: 'd=1', D: 'd=2', E: 'd=2', F: 'd=3' }, ds: 'Queue: []', order: ['A', 'B', 'C', 'D', 'E', 'F'], msg: 'Lấy D: chạm tới F (d=3 cạnh ít nhất!). BFS đảm bảo tìm đường ít cạnh nhất.' }
    ];
}

function makeDijkstraSteps() {
    return [
        { ns: { A: 'active' }, es: {}, dist: { A: 0, B: '∞', C: '∞', D: '∞', E: '∞', F: '∞' }, msg: 'Khởi tạo dist[A]=0, các đỉnh khác = ∞. Đưa (0, A) vào Min-Heap.' },
        { ns: { A: 'done', B: 'compare', C: 'compare' }, es: { 'A-B': 'active', 'A-C': 'active' }, dist: { A: 0, B: 4, C: 2, D: '∞', E: '∞', F: '∞' }, msg: 'Rút A (dist=0): nới lỏng A→B (4), A→C (2). C nhỏ hơn nên được chọn tiếp.' },
        { ns: { A: 'done', C: 'done', B: 'compare', D: 'compare', E: 'compare' }, es: { 'A-C': 'done', 'B-C': 'active', 'C-D': 'active', 'C-E': 'active' }, dist: { A: 0, B: 3, C: 2, D: 8, E: 10, F: '∞' }, msg: 'Rút C (dist=2): đi C→B tổng 2+1=3 < 4 → cập nhật dist[B]=3! Ngoài ra D=8, E=10.' },
        { ns: { A: 'done', C: 'done', B: 'done', D: 'compare' }, es: { 'A-C': 'done', 'B-C': 'done', 'B-D': 'active' }, dist: { A: 0, B: 3, C: 2, D: 8, E: 10, F: '∞' }, msg: 'Rút B (dist=3): thử 3+5=8 bằng dist[D]=8 nên giữ nguyên.' },
        { ns: { A: 'done', C: 'done', B: 'done', D: 'done', E: 'compare', F: 'compare' }, es: { 'A-C': 'done', 'B-C': 'done', 'C-D': 'done', 'D-E': 'active', 'D-F': 'active' }, dist: { A: 0, B: 3, C: 2, D: 8, E: 10, F: 14 }, msg: 'Rút D (dist=8): cập nhật dist[F]=8+6=14; D→E 8+2=10 không tốt hơn.' },
        { ns: { A: 'done', C: 'done', B: 'done', D: 'done', E: 'done', F: 'done' }, es: { 'A-C': 'done', 'B-C': 'done', 'C-D': 'done', 'D-E': 'done', 'E-F': 'active' }, dist: { A: 0, B: 3, C: 2, D: 8, E: 10, F: 13 }, msg: 'Rút E (dist=10): nới lỏng E→F tổng 10+3 = 13 < 14 → Đường ngắn nhất A→F là 13!' }
    ];
}

function makeKruskalSteps() {
    return [
        { ns: {}, es: {}, picked: [], msg: 'Kruskal bước 0: Sắp xếp tất cả cạnh tăng dần theo trọng số: (B,C:1), (A,C:2), (D,E:2), (E,F:3), (A,B:4), (B,D:5)...' },
        { ns: { B: 'done', C: 'done' }, es: { 'B-C': 'done' }, picked: ['B-C(1)'], msg: 'Chọn cạnh nhỏ nhất B-C (w=1): B, C khác nhóm DSU → Hợp nhất, thêm vào MST.' },
        { ns: { A: 'done', B: 'done', C: 'done' }, es: { 'B-C': 'done', 'A-C': 'done' }, picked: ['B-C(1)', 'A-C(2)'], msg: 'Chọn A-C (w=2): khác nhóm → thêm vào MST.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'done' }, es: { 'B-C': 'done', 'A-C': 'done', 'D-E': 'done' }, picked: ['B-C(1)', 'A-C(2)', 'D-E(2)'], msg: 'Chọn D-E (w=2): khác nhóm → thêm vào MST.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'done', F: 'done' }, es: { 'B-C': 'done', 'A-C': 'done', 'D-E': 'done', 'E-F': 'done' }, picked: ['B-C(1)', 'A-C(2)', 'D-E(2)', 'E-F(3)'], msg: 'Chọn E-F (w=3): nối F vào cụm {D,E}.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'done', F: 'done' }, es: { 'B-C': 'done', 'A-C': 'done', 'D-E': 'done', 'E-F': 'done', 'A-B': 'reject' }, picked: ['B-C(1)', 'A-C(2)', 'D-E(2)', 'E-F(3)'], msg: 'Xét A-B (w=4): find(A) == find(B) → Tạo chu trình A-C-B! BỎ QUA cạnh này.' },
        { ns: { A: 'done', B: 'done', C: 'done', D: 'done', E: 'done', F: 'done' }, es: { 'B-C': 'done', 'A-C': 'done', 'D-E': 'done', 'E-F': 'done', 'B-D': 'done' }, picked: ['B-C(1)', 'A-C(2)', 'D-E(2)', 'E-F(3)', 'B-D(5)'], msg: 'Chọn B-D (w=5): nối 2 thành phần lại! Đủ n-1 = 5 cạnh → Hoàn tất MST tổng trọng số = 13.' }
    ];
}

function makePrimSteps() {
    return [
        { ns: { A: 'done' }, es: {}, tree: ['A'], w: 0, msg: 'Prim bắt đầu từ 1 đỉnh A. Luôn chọn cạnh nhỏ nhất nối đỉnh TRONG cây ra NGOÀI cây.' },
        { ns: { A: 'done', C: 'done' }, es: { 'A-C': 'done' }, tree: ['A', 'C'], w: 2, msg: 'Từ {A} ra ngoài có A-C(2) và A-B(4) → chọn A-C(2).' },
        { ns: { A: 'done', C: 'done', B: 'done' }, es: { 'A-C': 'done', 'B-C': 'done' }, tree: ['A', 'C', 'B'], w: 3, msg: 'Từ {A,C} ra ngoài có C-B(1) nhỏ nhất → chọn C-B(1).' },
        { ns: { A: 'done', C: 'done', B: 'done', D: 'done' }, es: { 'A-C': 'done', 'B-C': 'done', 'B-D': 'done' }, tree: ['A', 'C', 'B', 'D'], w: 8, msg: 'Từ {A,B,C} ra ngoài có B-D(5) nhỏ hơn C-D(6) và C-E(8) → chọn B-D(5).' },
        { ns: { A: 'done', C: 'done', B: 'done', D: 'done', E: 'done' }, es: { 'A-C': 'done', 'B-C': 'done', 'B-D': 'done', 'D-E': 'done' }, tree: ['A', 'C', 'B', 'D', 'E'], w: 10, msg: 'Từ {A,B,C,D} ra ngoài có D-E(2) nhỏ nhất → chọn D-E(2).' },
        { ns: { A: 'done', C: 'done', B: 'done', D: 'done', E: 'done', F: 'done' }, es: { 'A-C': 'done', 'B-C': 'done', 'B-D': 'done', 'D-E': 'done', 'E-F': 'done' }, tree: ['A', 'C', 'B', 'D', 'E', 'F'], w: 13, msg: 'Cuối cùng chọn E-F(3). Tổng MST = 13 (đủ 6 đỉnh).' }
    ];
}

export function mountGraphs(host, piece) {
    const id = piece.id;

    if (id === 'graph-concepts' || id === 'graph-representation') {
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const mat = Array.from({ length: 6 }, () => Array(6).fill(0));
        G_EDGES.forEach(e => {
            const u = labels.indexOf(e.from), v = labels.indexOf(e.to);
            mat[u][v] = e.w;
            mat[v][u] = e.w;
        });
        const adj = {
            A: ['B(4)', 'C(2)'],
            B: ['A(4)', 'C(1)', 'D(5)'],
            C: ['A(2)', 'B(1)', 'D(6)', 'E(8)'],
            D: ['B(5)', 'C(6)', 'E(2)', 'F(6)'],
            E: ['C(8)', 'D(2)', 'F(3)'],
            F: ['D(6)', 'E(3)']
        };
        createStepper(host, {
            title: id === 'graph-concepts' ? 'Đỉnh, Cạnh, Bậc & Đường đi trên Đồ thị' : 'Biểu diễn Đồ thị: Ma trận kề O(V²) vs Danh sách kề O(V+E)',
            subtitle: 'Đồ thị thưa (E << V²) nên dùng Danh sách kề để duyệt DFS/BFS/Dijkstra nhanh hơn.',
            steps: [
                { view: 'graph', msg: 'Đồ thị vô hướng có trọng số gồm V = 6 đỉnh (A..F), E = 9 cạnh. Bậc đỉnh C là deg(C) = 4.' },
                { view: 'matrix', msg: 'Ma trận kề 6×6: kiểm tra có cạnh (u,v) mất O(1), nhưng tốn V² bộ nhớ ngay cả khi ít cạnh.' },
                { view: 'list', msg: 'Danh sách kề (Adjacency List): mỗi đỉnh chỉ lưu các đỉnh kề thực sự → tổng kích thước đúng 2E.' }
            ],
            render: (stage, f) => {
                if (f.view === 'graph') renderSvgGraph(stage, paintGraph({ C: 'active' }, { 'A-C': 'active', 'B-C': 'active', 'C-D': 'active', 'C-E': 'active' }));
                else if (f.view === 'matrix') renderMatrix(stage, mat, { rowHeaders: labels, colHeaders: labels, cellClass: (r, c, v) => v > 0 ? 'is-path' : '' });
                else {
                    stage.append(el('div', { class: 'viz-cards-grid' }, labels.map(k => el('div', { class: 'viz-mini-card' }, el('strong', {}, `${k}: `), el('span', { style: { fontFamily: 'var(--font-mono)' }, text: adj[k].join(' → ') })))));
                }
            }
        });
        return;
    }

    if (id === 'dfs') {
        createStepper(host, {
            title: 'DFS — Tìm kiếm theo chiều sâu (Stack / Đệ quy)',
            subtitle: 'Luôn đi sâu nhất có thể dọc theo một nhánh trước khi quay lui.',
            steps: makeDfsSteps(),
            stats: f => [['Thứ tự thăm', f.order.join(' → ') || 'chưa có']],
            render: (stage, f) => {
                renderSvgGraph(stage, paintGraph(f.ns, f.es));
                stage.append(el('p', { style: { textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12.5px', marginTop: '8px' }, text: f.ds }));
            }
        });
        return;
    }

    if (id === 'bfs') {
        createStepper(host, {
            title: 'BFS — Tìm kiếm theo chiều rộng (Queue + Đường ít cạnh nhất)',
            subtitle: 'Mở rộng loang đều từng lớp khoảng cách 0 → 1 → 2 → 3 bằng Queue.',
            steps: makeBfsSteps(),
            stats: f => [['Đã duyệt', f.order.join(' → ')]],
            render: (stage, f) => {
                renderSvgGraph(stage, paintGraph(f.ns, f.es, f.subs));
                stage.append(el('p', { style: { textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12.5px', marginTop: '8px' }, text: f.ds }));
            }
        });
        return;
    }

    if (id === 'dijkstra') {
        createStepper(host, {
            title: 'Thuật toán Dijkstra (Đường đi ngắn nhất từ A, trọng số ≥ 0)',
            subtitle: 'Luôn chốt đỉnh có dist nhỏ nhất chưa chốt bằng Priority Queue rồi nới lỏng cạnh kề.',
            steps: makeDijkstraSteps(),
            render: (stage, f) => {
                renderSvgGraph(stage, paintGraph(f.ns, f.es, Object.fromEntries(Object.entries(f.dist).map(([k, v]) => [k, `d=${v}`]))));
                renderCells(stage, Object.entries(f.dist).map(([k, v]) => ({ val: v, sub: `dist[${k}]` })), {}, 'Bảng khoảng cách tạm thời từ A');
            }
        });
        return;
    }

    if (id === 'mst' || id === 'kruskal') {
        createStepper(host, {
            title: id === 'mst' ? 'Cây khung nhỏ nhất (MST) & Tính chất Cắt/Chu trình' : 'Thuật toán Kruskal (Sắp cạnh + Union-Find / DSU)',
            subtitle: 'Duyệt cạnh từ nhẹ đến nặng, chỉ kết nạp cạnh không tạo chu trình cho tới khi đủ V - 1 cạnh.',
            steps: makeKruskalSteps(),
            stats: f => [['Số cạnh MST', `${f.picked.length} / 5`]],
            render: (stage, f) => {
                renderSvgGraph(stage, paintGraph(f.ns, f.es));
                stage.append(el('p', { style: { textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12.5px', marginTop: '8px' }, text: `Cạnh đã chọn: ${f.picked.join(', ') || '(chưa có)'}` }));
            }
        });
        return;
    }

    if (id === 'prim') {
        createStepper(host, {
            title: 'Thuật toán Prim (Mở rộng cây khung từ 1 đỉnh)',
            subtitle: 'Luôn lấy cạnh nhẹ nhất bắc từ tập đỉnh ĐÃ trong cây sang đỉnh NGOÀI cây.',
            steps: makePrimSteps(),
            stats: f => [['Tổng trọng số', f.w], ['Đỉnh trong cây', f.tree.join(', ')]],
            render: (stage, f) => renderSvgGraph(stage, paintGraph(f.ns, f.es))
        });
        return;
    }

    if (id === 'floyd') {
        const labels = ['1', '2', '3', '4'];
        const inf = Infinity;
        const m0 = [[0, 3, inf, 7], [8, 0, 2, inf], [5, inf, 0, 1], [2, inf, inf, 0]];
        const m1 = [[0, 3, inf, 7], [8, 0, 2, 15], [5, 8, 0, 1], [2, 5, inf, 0]];
        const m2 = [[0, 3, 5, 7], [8, 0, 2, 15], [5, 8, 0, 1], [2, 5, 7, 0]];
        const m3 = [[0, 3, 5, 6], [7, 0, 2, 3], [5, 8, 0, 1], [2, 5, 7, 0]];
        const m4 = [[0, 3, 5, 6], [5, 0, 2, 3], [3, 6, 0, 1], [2, 5, 7, 0]];
        const steps = [
            { k: 0, m: m0, chg: [], msg: 'Ma trận D^(0) ban đầu từ trọng số các cạnh trực tiếp.' },
            { k: 1, m: m1, chg: [[1, 3], [2, 1], [3, 1]], msg: 'Cho phép đi qua đỉnh trung gian k = 1: cập nhật (2→4)=15, (3→2)=8, (4→2)=5.' },
            { k: 2, m: m2, chg: [[0, 2], [3, 2]], msg: 'Trung gian k = 2: tìm được (1→3) qua 2 = 3+2 = 5 < ∞ và (4→3)=7.' },
            { k: 3, m: m3, chg: [[0, 3], [1, 3]], msg: 'Trung gian k = 3: cập nhật (1→4) qua 3 = 5+1 = 6; (2→4) qua 3 = 2+1 = 3.' },
            { k: 4, m: m4, chg: [[1, 0], [2, 0], [2, 1]], msg: 'Trung gian k = 4: cập nhật (2→1)=5, (3→1)=3, (3→2)=6. Xong mọi cặp đỉnh trong O(V³)!' }
        ];
        createStepper(host, {
            title: 'Floyd-Warshall: Đường đi ngắn nhất mọi cặp đỉnh O(V³)',
            subtitle: 'Thử lần lượt từng đỉnh k = 1..V làm đỉnh trung gian để rút ngắn dist[i][j].',
            steps,
            stats: f => [['Đỉnh trung gian k', f.k === 0 ? 'Khởi tạo' : `k = ${f.k}`]],
            codeLines: [
                'for (int k = 0; k < V; k++)',
                '  for (int i = 0; i < V; i++)',
                '    for (int j = 0; j < V; j++)',
                '      d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);'
            ],
            render: (stage, f) => {
                const changed = new Set(f.chg.map(([r, c]) => `${r}-${c}`));
                renderMatrix(stage, f.m, {
                    rowHeaders: labels,
                    colHeaders: labels,
                    cellClass: (r, c) => changed.has(`${r}-${c}`) ? 'is-path' : (f.k > 0 && (r === f.k - 1 || c === f.k - 1) ? 'is-source' : '')
                });
            }
        });
        return;
    }

    // hw-graph
    createStepper(host, {
        title: 'Thực hành Tổng hợp Đồ thị (BFS / DFS / Dijkstra)',
        subtitle: 'So sánh mục tiêu và đầu ra của 3 thuật toán nền tảng trên cùng một đồ thị.',
        presets: [
            { label: 'BFS (ít cạnh nhất)', steps: () => makeBfsSteps().map(s => ({ ...s, subs: s.subs || {} })) },
            { label: 'DFS (liên thông / chu trình)', steps: () => makeDfsSteps().map(s => ({ ...s, subs: {} })) },
            { label: 'Dijkstra (tổng trọng số min)', steps: () => makeDijkstraSteps().map(s => ({ ...s, subs: Object.fromEntries(Object.entries(s.dist).map(([k, v]) => [k, `d=${v}`])), ds: 'Min-Heap dist[]' })) }
        ],
        steps: makeBfsSteps().map(s => ({ ...s, subs: s.subs || {} })),
        render: (stage, f) => renderSvgGraph(stage, paintGraph(f.ns, f.es, f.subs || {}))
    });
}
