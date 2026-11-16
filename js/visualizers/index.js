const GROUPS = {
    sorting: ['sorting-problem', 'bubble-sort', 'selection-sort', 'insertion-sort', 'shuffle-sort', 'quick-sort', 'merge-sort', 'sort-properties', 'hw-sorting-benchmark', 'ex-count-pairs', 'heap-sort', 'sequential-search', 'binary-search', 'generic-bubble-sort'],
    linear: ['abstraction-adt', 'list-adt', 'array-list', 'linked-list', 'linked-list-variants', 'hw-list', 'stack-adt', 'bracket-matching', 'postfix-eval', 'queue-adt', 'circular-array-queue', 'linked-queue', 'palindrome-stack-queue'],
    trees: ['tree-concepts', 'binary-tree', 'binary-tree-repr', 'tree-traversal', 'expression-tree', 'priority-queue-adt', 'binary-heap', 'heap-insert', 'heap-removemin', 'hw-priority-queue', 'bst-property', 'bst-operations', 'bst-balance', 'bst-geometric-apps', 'hw-bst', 'hash-table'],
    graphs: ['graph-concepts', 'graph-representation', 'dfs', 'bfs', 'mst', 'prim', 'kruskal', 'dijkstra', 'floyd', 'hw-graph'],
    recursion: ['algorithm-problem', 'recursion', 'tower-of-hanoi', 'fibonacci', 'recursion-elimination', 'divide-and-conquer', 'minmax-dc', 'strassen', 'tromino-tiling', 'decrease-transform-conquer', 'brute-force', 'string-matching-bf', 'backtracking', 'binary-strings', 'n-queens', 'maze-stack', 'maze-path-backtracking', 'branch-and-bound', 'tsp-bnb', 'hw-trial-error'],
    dp: ['greedy-method', 'coin-change-greedy', 'activity-selection', 'hw-greedy', 'dynamic-programming', 'dp-elements', 'binomial-dp', 'lis', 'knapsack-01', 'grid-path-dp', 'lcs', 'hw-dp'],
    oopmath: ['java-interface-abstract', 'java-generics', 'comparable-interface', 'running-time-model', 'big-o', 'sum-product-rules', 'best-worst-average', 'complexity-classes', 'turing-machine', 'hw-turing', 'recursion-correctness', 'recurrence-relation', 'substitution-method', 'master-theorem', 'hw-recurrences', 'bubble-sort-cost', 'comparison-sort-lower-bound', 'full-binary-tree-height', 'heap-height']
};

const LOADERS = {
    sorting: () => import('./sorting.js').then(m => m.mountSorting),
    linear: () => import('./linear.js').then(m => m.mountLinear),
    trees: () => import('./trees.js').then(m => m.mountTrees),
    graphs: () => import('./graphs.js').then(m => m.mountGraphs),
    recursion: () => import('./recursion-bt.js').then(m => m.mountRecursion),
    dp: () => import('./dp-greedy.js').then(m => m.mountDpGreedy),
    oopmath: () => import('./oop-math.js').then(m => m.mountOopMath)
};

export const VISUALIZER_REGISTRY = Object.fromEntries(
    Object.entries(GROUPS).flatMap(([group, ids]) => ids.map(id => [id, group]))
);

export function hasVisualizer(id) {
    return Object.hasOwn(VISUALIZER_REGISTRY, id);
}

export async function mountVisualizer(host, piece) {
    const group = VISUALIZER_REGISTRY[piece.id];
    if (!group) {
        host.innerHTML = '<p class="viz-loading">Bài này chưa có mô phỏng.</p>';
        return;
    }
    try {
        const mount = await LOADERS[group]();
        host.innerHTML = '';
        mount(host, piece);
    } catch (error) {
        console.error(error);
        host.innerHTML = `<p class="notice">Không tải được mô phỏng: ${String(error.message).replace(/</g, '&lt;')}</p>`;
    }
}
