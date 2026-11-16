const GROUPS = {
    sorting: ['sorting-problem', 'bubble-sort', 'selection-sort', 'insertion-sort', 'shuffle-sort', 'quick-sort', 'merge-sort', 'sort-properties', 'hw-sorting-benchmark', 'ex-count-pairs', 'heap-sort', 'sequential-search', 'binary-search', 'generic-bubble-sort'],
    linear: ['abstraction-adt', 'list-adt', 'array-list', 'linked-list', 'linked-list-variants', 'hw-list', 'stack-adt', 'bracket-matching', 'postfix-eval', 'queue-adt', 'circular-array-queue', 'linked-queue', 'palindrome-stack-queue'],
    trees: ['tree-concepts', 'binary-tree', 'binary-tree-repr', 'tree-traversal', 'expression-tree', 'priority-queue-adt', 'binary-heap', 'heap-insert', 'heap-removemin', 'hw-priority-queue', 'bst-property', 'bst-operations', 'bst-balance', 'bst-geometric-apps', 'hw-bst', 'hash-table'],
    graphs: ['graph-concepts', 'graph-representation', 'dfs', 'bfs', 'mst', 'prim', 'kruskal', 'dijkstra', 'floyd', 'hw-graph'],
    recursion: ['algorithm-problem', 'recursion', 'tower-of-hanoi', 'fibonacci', 'recursion-elimination', 'divide-and-conquer', 'minmax-dc', 'strassen', 'tromino-tiling', 'decrease-transform-conquer', 'brute-force', 'string-matching-bf', 'backtracking', 'binary-strings', 'n-queens', 'maze-stack', 'maze-path-backtracking', 'branch-and-bound', 'tsp-bnb', 'hw-trial-error'],
    dp: ['greedy-method', 'coin-change-greedy', 'activity-selection', 'hw-greedy', 'dynamic-programming', 'dp-elements', 'binomial-dp', 'lis', 'knapsack-01', 'grid-path-dp', 'lcs', 'hw-dp'],
    oopmath: ['java-interface-abstract', 'java-generics', 'comparable-interface', 'running-time-model', 'big-o', 'sum-product-rules', 'best-worst-average', 'complexity-classes', 'turing-machine', 'hw-turing', 'recursion-correctness', 'recurrence-relation', 'substitution-method', 'master-theorem', 'hw-recurrences', 'bubble-sort-cost', 'comparison-sort-lower-bound', 'full-binary-tree-height', 'heap-height'],
    basics: [
        'cb-java-program-bytecode', 'cb-primitive-types-variables', 'cb-operators-expressions',
        'cb-methods-intro', 'cb-variable-scope', 'cb-scanner-io-format',
        'cb-branching-if-switch', 'cb-loops-break-continue', 'cb-coding-style',
        'cb-array-1d', 'cb-array-2d', 'cb-array-methods',
        'cb-ex-array-sort-search', 'cb-java-api-math-string', 'cb-class-object-constructor',
        'cb-reference-vs-primitive', 'cb-static-members', 'cb-ex-string-vigenere',
        'cb-access-control', 'cb-class-scope-this', 'cb-packages-arraylist',
        'cb-encapsulation-debug', 'cb-interface-contract', 'cb-inheritance-oop',
        'cb-exceptions-checked-unchecked', 'cb-try-catch-finally-throw',
        'cb-io-streams-files', 'cb-text-binary-serialization', 'cb-swing-gui-basics'
    ],
    oop: [
        'oop-variables-types', 'oop-stack-heap-memory', 'oop-parameter-passing',
        'oop-paradigm-class-object', 'oop-encapsulation-modifiers', 'oop-constructors-this',
        'oop-java-api-wrapper', 'oop-inheritance-super', 'oop-object-class-contract',
        'oop-casting-instanceof', 'oop-polymorphism-dispatch', 'oop-uml-class-diagram',
        'oop-jcf-hierarchy-list', 'oop-set-queue-map', 'oop-iterator-collections-utils',
        'oop-solid-principles', 'oop-design-patterns-intro', 'oop-singleton-pattern',
        'oop-factory-method-abstract-factory', 'oop-adapter-facade', 'oop-decorator-pattern',
        'oop-bridge-proxy', 'oop-strategy-pattern', 'oop-observer-pattern',
        'oop-template-method-iterator', 'oop-command-state', 'oop-chain-mediator-visitor',
        'oop-generic-methods-bounded', 'oop-generics-wildcards', 'oop-type-erasure-restrictions',
        'oop-functional-interface-lambda', 'oop-standard-functional-interfaces',
        'oop-stream-api-basics', 'oop-stream-operations-collectors',
        'oop-ex-matrix', 'oop-ex-integration', 'oop-ex-statistics', 'oop-ex-student-manager'
    ]
};

const LOADERS = {
    sorting: () => import('./sorting.js').then(m => m.mountSorting),
    linear: () => import('./linear.js').then(m => m.mountLinear),
    trees: () => import('./trees.js').then(m => m.mountTrees),
    graphs: () => import('./graphs.js').then(m => m.mountGraphs),
    recursion: () => import('./recursion-bt.js').then(m => m.mountRecursion),
    dp: () => import('./dp-greedy.js').then(m => m.mountDpGreedy),
    oopmath: () => import('./oop-math.js').then(m => m.mountOopMath),
    basics: () => import('./basics.js').then(m => m.mountBasics),
    oop: () => import('./oop.js').then(m => m.mountOop)
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
