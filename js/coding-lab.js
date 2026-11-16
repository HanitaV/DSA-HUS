const CODE_KEY_PREFIX = 'hus.code.v1.';
const SOLVED_KEY = 'hus.solved.v1';

function readStorage(key, fallback = null) {
    try {
        const val = window.localStorage.getItem(key);
        return val == null ? fallback : val;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

export function loadSolvedSet() {
    try {
        const raw = readStorage(SOLVED_KEY, '[]');
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []);
    } catch {
        return new Set();
    }
}

function markSolved(id) {
    const set = loadSolvedSet();
    set.add(id);
    writeStorage(SOLVED_KEY, JSON.stringify([...set]));
}

/**
 * Lightweight Java-subset-to-JS preprocessor so students can write natural Java-style
 * DSA methods (int[], int, boolean, String, for (int i = 0; ...), new int[n])
 * and run them directly in the browser without a server.
 */
export function prepareUserCode(source) {
    const strings = [];
    let masked = String(source || '').replace(
        /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
        m => {
            if (m.startsWith('//') || m.startsWith('/*')) return ' ';
            strings.push(m);
            return `\u0001${strings.length - 1}\u0001`;
        }
    );

    masked = masked
        .replace(/\bInteger\.MAX_VALUE\b/g, 'Infinity')
        .replace(/\bInteger\.MIN_VALUE\b/g, '-Infinity')
        .replace(/\bArrays\.sort\s*\(\s*([A-Za-z_]\w*)\s*\)/g, '$1.sort((__x, __y) => __x - __y)')
        .replace(/\bArrays\.fill\s*\(\s*([A-Za-z_]\w*)\s*,\s*([^)]+)\)/g, '$1.fill($2)')
        .replace(/\bArrays\.copyOf\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/g, '$1.slice(0, $2)')
        .replace(/\bSystem\.out\.println\s*\(/g, '__print(')
        .replace(/\.length\s*\(\s*\)/g, '.length')
        .replace(/\.charAt\s*\(([^)]+)\)/g, '[$1]')
        .replace(/\.equals\s*\(([^)]+)\)/g, ' === ($1)')
        .replace(/\bnew\s+(?:int|long|double|float|boolean|char|String)\s*\[\s*\]\s*\{([^}]*)\}/g, '[$1]')
        .replace(/\bnew\s+(?:int|long|double|float)\s*\[([^\]]+)\]\s*\[([^\]]+)\]/g, 'Array.from({ length: $1 }, () => new Array($2).fill(0))')
        .replace(/\bnew\s+boolean\s*\[([^\]]+)\]\s*\[([^\]]+)\]/g, 'Array.from({ length: $1 }, () => new Array($2).fill(false))')
        .replace(/\bnew\s+(?:int|long|double|float)\s*\[([^\]]+)\]/g, 'new Array($1).fill(0)')
        .replace(/\bnew\s+boolean\s*\[([^\]]+)\]/g, 'new Array($1).fill(false)')
        .replace(/\bnew\s+String\s*\[([^\]]+)\]/g, 'new Array($1).fill("")');

    // Convert Java method declarations: [public|private] [static] ReturnType name(Type p1, Type[] p2)
    masked = masked.replace(
        /(?:^|[;\n}])\s*(?:(?:public|private|protected)\s+)?(?:static\s+)?(?:void|int|long|double|float|boolean|char|String)(?:\[\])*\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/g,
        (full, name, params) => {
            const prefix = full.startsWith('}') ? '}\n' : full.startsWith(';') ? ';\n' : '\n';
            const cleanParams = params
                .split(',')
                .map(p => p.trim())
                .filter(Boolean)
                .map(p => {
                    const parts = p.replace(/\[\]/g, '').trim().split(/\s+/);
                    return parts[parts.length - 1];
                })
                .join(', ');
            return `${prefix}function ${name}(${cleanParams}) {`;
        }
    );

    // Convert local typed variable declarations (including inside for-loops)
    masked = masked.replace(
        /\b(?:final\s+)?(?:int|long|double|float|boolean|char|String)(?:\s*\[\s*\])*\s+(?=[A-Za-z_]\w*\s*(?:=|;|,|in\b))/g,
        'let '
    );

    return masked.replace(/\u0001(\d+)\u0001/g, (_, idx) => strings[Number(idx)]);
}

function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        const ka = Object.keys(a), kb = Object.keys(b);
        return ka.length === kb.length && ka.every(k => deepEqual(a[k], b[k]));
    }
    return false;
}

function cloneVal(v) {
    if (Array.isArray(v)) return v.map(cloneVal);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, cloneVal(val)]));
    return v;
}

function formatVal(v) {
    if (v === undefined) return 'undefined';
    try { return JSON.stringify(v); } catch { return String(v); }
}

export function runChallengeTests(challenge, userCode) {
    const jsCode = prepareUserCode(userCode);
    const logs = [];
    let fn;
    try {
        const factory = new Function('__print', `${jsCode}\nreturn typeof ${challenge.fnName} === 'function' ? ${challenge.fnName} : null;`);
        fn = factory((...args) => logs.push(args.map(formatVal).join(' ')));
    } catch (err) {
        return {
            ok: false,
            error: `Lỗi cú pháp: ${err.message}`,
            results: [],
            logs
        };
    }

    if (typeof fn !== 'function') {
        return {
            ok: false,
            error: `Không tìm thấy hàm "${challenge.fnName}". Hãy giữ nguyên tên hàm trong khung code.`,
            results: [],
            logs
        };
    }

    const results = challenge.tests.map((tc, idx) => {
        try {
            const args = cloneVal(tc.args);
            const rawResult = fn(...args);
            const actual = challenge.inPlace ? args[0] : rawResult;
            const pass = deepEqual(actual, tc.expected);
            return {
                name: tc.name || `Test ${idx + 1}`,
                pass,
                input: tc.args.map(formatVal).join(', '),
                expected: formatVal(tc.expected),
                actual: formatVal(actual),
                error: null
            };
        } catch (err) {
            return {
                name: tc.name || `Test ${idx + 1}`,
                pass: false,
                input: tc.args.map(formatVal).join(', '),
                expected: formatVal(tc.expected),
                actual: 'Lỗi khi chạy',
                error: err.message
            };
        }
    });

    return {
        ok: results.every(r => r.pass),
        error: null,
        results,
        logs
    };
}

export const CHALLENGES = {
    'bubble-sort': {
        title: 'Cài đặt Bubble Sort tối ưu dừng sớm',
        prompt: 'Sắp xếp mảng số nguyên `a` tăng dần tại chỗ và trả về mảng `a`. Dùng biến cờ `swapped` để dừng sớm nếu một lượt không có phép hoán đổi nào.',
        fnName: 'bubbleSort',
        inPlace: true,
        starter: `static int[] bubbleSort(int[] a) {\n    int n = a.length;\n    for (int i = 0; i < n - 1; i++) {\n        boolean swapped = false;\n        // TODO: duyệt j từ 0 đến n - 2 - i, đổi chỗ nếu a[j] > a[j + 1]\n        \n        if (!swapped) break;\n    }\n    return a;\n}`,
        solution: `static int[] bubbleSort(int[] a) {\n    int n = a.length;\n    for (int i = 0; i < n - 1; i++) {\n        boolean swapped = false;\n        for (int j = 0; j < n - 1 - i; j++) {\n            if (a[j] > a[j + 1]) {\n                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;\n                swapped = true;\n            }\n        }\n        if (!swapped) break;\n    }\n    return a;\n}`,
        hint: 'Trong vòng lặp j từ 0 đến n - 2 - i: nếu a[j] > a[j + 1] thì hoán đổi hai phần tử và đặt swapped = true.',
        tests: [
            { name: 'Mảng thường', args: [[5, 1, 4, 2, 8]], expected: [1, 2, 4, 5, 8] },
            { name: 'Đã sắp & trùng giá trị', args: [[1, 2, 2, 3]], expected: [1, 2, 2, 3] },
            { name: 'Mảng rỗng / 1 phần tử', args: [[]], expected: [] },
            { name: 'Giảm dần có số âm', args: [[3, -1, 0, -5]], expected: [-5, -1, 0, 3] }
        ]
    },
    'selection-sort': {
        title: 'Cài đặt Selection Sort',
        prompt: 'Với mỗi vị trí `i`, tìm chỉ số `minIdx` của phần tử nhỏ nhất trong đoạn `a[i..n-1]` rồi đổi chỗ với `a[i]`.',
        fnName: 'selectionSort',
        inPlace: true,
        starter: `static int[] selectionSort(int[] a) {\n    int n = a.length;\n    for (int i = 0; i < n - 1; i++) {\n        int minIdx = i;\n        // TODO: tìm minIdx trong [i + 1 .. n - 1] và đổi chỗ với a[i]\n        \n    }\n    return a;\n}`,
        solution: `static int[] selectionSort(int[] a) {\n    int n = a.length;\n    for (int i = 0; i < n - 1; i++) {\n        int minIdx = i;\n        for (int j = i + 1; j < n; j++) {\n            if (a[j] < a[minIdx]) minIdx = j;\n        }\n        int t = a[i]; a[i] = a[minIdx]; a[minIdx] = t;\n    }\n    return a;\n}`,
        hint: 'Duyệt j từ i + 1 đến n - 1; nếu a[j] < a[minIdx] thì cập nhật minIdx = j. Sau vòng j mới hoán đổi a[i] và a[minIdx].',
        tests: [
            { name: 'Mảng thường', args: [[64, 25, 12, 22, 11]], expected: [11, 12, 22, 25, 64] },
            { name: 'Phần tử trùng', args: [[4, 2, 4, 1]], expected: [1, 2, 4, 4] },
            { name: 'Mảng 1 phần tử', args: [[7]], expected: [7] }
        ]
    },
    'insertion-sort': {
        title: 'Cài đặt Insertion Sort',
        prompt: 'Chèn từng phần tử `key = a[i]` vào đúng vị trí trong đoạn đã sắp `a[0..i-1]` bằng cách dịch phải các phần tử lớn hơn `key`.',
        fnName: 'insertionSort',
        inPlace: true,
        starter: `static int[] insertionSort(int[] a) {\n    for (int i = 1; i < a.length; i++) {\n        int key = a[i];\n        int j = i - 1;\n        // TODO: dịch các phần tử > key sang phải và đặt key vào j + 1\n        \n    }\n    return a;\n}`,
        solution: `static int[] insertionSort(int[] a) {\n    for (int i = 1; i < a.length; i++) {\n        int key = a[i];\n        int j = i - 1;\n        while (j >= 0 && a[j] > key) {\n            a[j + 1] = a[j];\n            j--;\n        }\n        a[j + 1] = key;\n    }\n    return a;\n}`,
        hint: 'Dùng while (j >= 0 && a[j] > key) để dịch a[j + 1] = a[j] và giảm j; thoát vòng lặp thì gán a[j + 1] = key.',
        tests: [
            { name: 'Mảng thường', args: [[5, 2, 4, 6, 1, 3]], expected: [1, 2, 3, 4, 5, 6] },
            { name: 'Mảng rỗng', args: [[]], expected: [] },
            { name: 'Trùng nhau', args: [[3, 3, 1, 2]], expected: [1, 2, 3, 3] }
        ]
    },
    'quick-sort': {
        title: 'Cài đặt Quick Sort (phân hoạch Lomuto)',
        prompt: 'Viết hàm đệ quy `quickSort(a, low, high)` chọn chốt `a[high]`, phân hoạch đoạn `[low..high]` và sắp xếp hai nửa.',
        fnName: 'sortArray',
        inPlace: true,
        starter: `static void quickSort(int[] a, int low, int high) {\n    if (low >= high) return;\n    int pivot = a[high];\n    int i = low - 1;\n    // TODO: phân hoạch các phần tử <= pivot về bên trái, đặt pivot vào i + 1, rồi gọi đệ quy\n    \n}\n\nstatic int[] sortArray(int[] a) {\n    quickSort(a, 0, a.length - 1);\n    return a;\n}`,
        solution: `static void quickSort(int[] a, int low, int high) {\n    if (low >= high) return;\n    int pivot = a[high];\n    int i = low - 1;\n    for (int j = low; j < high; j++) {\n        if (a[j] <= pivot) {\n            i++;\n            int t = a[i]; a[i] = a[j]; a[j] = t;\n        }\n    }\n    int t = a[i + 1]; a[i + 1] = a[high]; a[high] = t;\n    quickSort(a, low, i);\n    quickSort(a, i + 2, high);\n}\n\nstatic int[] sortArray(int[] a) {\n    quickSort(a, 0, a.length - 1);\n    return a;\n}`,
        hint: 'Chốt nằm ở i + 1 sau phân hoạch, nên hai lời gọi đệ quy là quickSort(a, low, i) và quickSort(a, i + 2, high).',
        tests: [
            { name: 'Mảng thường', args: [[5, 2, 8, 1, 9, 3]], expected: [1, 2, 3, 5, 8, 9] },
            { name: 'Nhiều phần tử bằng nhau', args: [[2, 2, 2, 1, 2]], expected: [1, 2, 2, 2, 2] },
            { name: 'Mảng rỗng', args: [[]], expected: [] }
        ]
    },
    'merge-sort': {
        title: 'Cài đặt hàm trộn (Merge) hai nửa đã sắp',
        prompt: 'Hoàn thiện hàm `merge(a, l, m, r)` để trộn hai đoạn đã sắp `a[l..m]` và `a[m+1..r]` theo thứ tự tăng dần.',
        fnName: 'sortArray',
        inPlace: true,
        starter: `static void merge(int[] a, int l, int m, int r) {\n    int n1 = m - l + 1, n2 = r - m;\n    int[] L = new int[n1];\n    int[] R = new int[n2];\n    for (int i = 0; i < n1; i++) L[i] = a[l + i];\n    for (int j = 0; j < n2; j++) R[j] = a[m + 1 + j];\n    // TODO: trộn L và R lại vào a[l..r]\n    \n}\n\nstatic void mergeSort(int[] a, int l, int r) {\n    if (l >= r) return;\n    int m = l + Math.floor((r - l) / 2);\n    mergeSort(a, l, m);\n    mergeSort(a, m + 1, r);\n    merge(a, l, m, r);\n}\n\nstatic int[] sortArray(int[] a) {\n    if (a.length > 0) mergeSort(a, 0, a.length - 1);\n    return a;\n}`,
        solution: `static void merge(int[] a, int l, int m, int r) {\n    int n1 = m - l + 1, n2 = r - m;\n    int[] L = new int[n1];\n    int[] R = new int[n2];\n    for (int i = 0; i < n1; i++) L[i] = a[l + i];\n    for (int j = 0; j < n2; j++) R[j] = a[m + 1 + j];\n    int i = 0, j = 0, k = l;\n    while (i < n1 && j < n2) {\n        if (L[i] <= R[j]) a[k++] = L[i++];\n        else a[k++] = R[j++];\n    }\n    while (i < n1) a[k++] = L[i++];\n    while (j < n2) a[k++] = R[j++];\n}\n\nstatic void mergeSort(int[] a, int l, int r) {\n    if (l >= r) return;\n    int m = l + Math.floor((r - l) / 2);\n    mergeSort(a, l, m);\n    mergeSort(a, m + 1, r);\n    merge(a, l, m, r);\n}\n\nstatic int[] sortArray(int[] a) {\n    if (a.length > 0) mergeSort(a, 0, a.length - 1);\n    return a;\n}`,
        hint: 'Dùng 3 con trỏ i=0, j=0, k=l; so sánh L[i] <= R[j] để giữ tính ổn định, rồi chép phần còn lại của L hoặc R.',
        tests: [
            { name: 'Mảng lẻ phần tử', args: [[38, 27, 43, 3, 9, 82, 10]], expected: [3, 9, 10, 27, 38, 43, 82] },
            { name: 'Mảng 1 phần tử', args: [[42]], expected: [42] },
            { name: 'Mảng rỗng', args: [[]], expected: [] }
        ]
    },
    'binary-search': {
        title: 'Cài đặt Tìm kiếm nhị phân',
        prompt: 'Cho mảng `a` đã sắp xếp tăng dần và số `target`. Trả về chỉ số của `target` trong `a`, hoặc `-1` nếu không tồn tại.',
        fnName: 'binarySearch',
        starter: `static int binarySearch(int[] a, int target) {\n    int low = 0, high = a.length - 1;\n    while (low <= high) {\n        int mid = low + Math.floor((high - low) / 2);\n        // TODO: kiểm tra a[mid] với target và thu hẹp [low..high]\n        \n    }\n    return -1;\n}`,
        solution: `static int binarySearch(int[] a, int target) {\n    int low = 0, high = a.length - 1;\n    while (low <= high) {\n        int mid = low + Math.floor((high - low) / 2);\n        if (a[mid] == target) return mid;\n        if (a[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
        hint: 'Nhớ điều kiện vòng lặp là low <= high, và cập nhật low = mid + 1 hoặc high = mid - 1 để không lặp vô hạn.',
        tests: [
            { name: 'Tìm thấy ở giữa', args: [[1, 3, 5, 7, 9, 11], 7], expected: 3 },
            { name: 'Tìm thấy ở biên đầu', args: [[2, 4, 6, 8], 2], expected: 0 },
            { name: 'Không tồn tại', args: [[1, 3, 5, 7], 4], expected: -1 },
            { name: 'Mảng rỗng', args: [[], 5], expected: -1 }
        ]
    },
    'sequential-search': {
        title: 'Cài đặt Tìm kiếm tuần tự',
        prompt: 'Trả về chỉ số đầu tiên của `target` trong mảng `a` (chưa cần sắp xếp), hoặc `-1` nếu không tìm thấy.',
        fnName: 'linearSearch',
        starter: `static int linearSearch(int[] a, int target) {\n    // TODO: duyệt từ đầu mảng và trả về chỉ số đầu tiên bằng target\n    \n    return -1;\n}`,
        solution: `static int linearSearch(int[] a, int target) {\n    for (int i = 0; i < a.length; i++) {\n        if (a[i] == target) return i;\n    }\n    return -1;\n}`,
        hint: 'Duyệt i từ 0 đến a.length - 1, nếu a[i] == target thì return i ngay.',
        tests: [
            { name: 'Tìm thấy', args: [[9, 4, 2, 4, 7], 4], expected: 1 },
            { name: 'Không thấy', args: [[9, 4, 2], 5], expected: -1 },
            { name: 'Mảng rỗng', args: [[], 1], expected: -1 }
        ]
    },
    'ex-count-pairs': {
        title: 'Đếm cặp phần tử có tổng bằng K',
        prompt: 'Cho mảng `a` gồm các số nguyên phân biệt và số `k`. Đếm số cặp `(i, j)` với `i < j` sao cho `a[i] + a[j] == k`.',
        fnName: 'countPairs',
        starter: `static int countPairs(int[] a, int k) {\n    Arrays.sort(a);\n    int left = 0, right = a.length - 1, count = 0;\n    // TODO: dùng hai con trỏ hoặc tìm kiếm nhị phân để đếm\n    \n    return count;\n}`,
        solution: `static int countPairs(int[] a, int k) {\n    Arrays.sort(a);\n    int left = 0, right = a.length - 1, count = 0;\n    while (left < right) {\n        int sum = a[left] + a[right];\n        if (sum == k) { count++; left++; right--; }\n        else if (sum < k) left++;\n        else right--;\n    }\n    return count;\n}`,
        hint: 'Khi đã sắp xếp tăng dần: nếu a[left] + a[right] < k thì tăng left; > k thì giảm right; == k thì tăng count và dịch cả hai con trỏ.',
        tests: [
            { name: 'Nhiều cặp', args: [[1, 5, 7, -1, 2], 6], expected: 2 },
            { name: 'Không có cặp', args: [[1, 2, 3], 10], expected: 0 },
            { name: 'Mảng 1 phần tử', args: [[5], 10], expected: 0 }
        ]
    },
    'bracket-matching': {
        title: 'Kiểm tra dấu ngoặc hợp lệ bằng Stack',
        prompt: 'Cho chuỗi `s` chỉ gồm các ký tự `(`, `)`, `[`, `]`, `{`, `}`. Trả về `true` nếu ngoặc đóng mở đúng cặp và đúng thứ tự.',
        fnName: 'isValidBrackets',
        starter: `static boolean isValidBrackets(String s) {\n    let stack = [];\n    for (int i = 0; i < s.length(); i++) {\n        let ch = s.charAt(i);\n        // TODO: gặp ngoặc mở thì push; gặp ngoặc đóng thì pop và kiểm tra khớp\n        \n    }\n    return stack.length == 0;\n}`,
        solution: `static boolean isValidBrackets(String s) {\n    let stack = [];\n    for (int i = 0; i < s.length(); i++) {\n        let ch = s.charAt(i);\n        if (ch == '(' || ch == '[' || ch == '{') {\n            stack.push(ch);\n        } else {\n            if (stack.length == 0) return false;\n            let top = stack.pop();\n            if ((ch == ')' && top != '(') || (ch == ']' && top != '[') || (ch == '}' && top != '{')) {\n                return false;\n            }\n        }\n    }\n    return stack.length == 0;\n}`,
        hint: 'Đừng quên kiểm tra stack rỗng trước khi pop, và kiểm tra stack.length == 0 ở cuối để tránh sót ngoặc mở.',
        tests: [
            { name: 'Hợp lệ lồng nhau', args: ['({[]})'], expected: true },
            { name: 'Sai thứ tự', args: ['([)]'], expected: false },
            { name: 'Dư ngoặc đóng', args: ['())'], expected: false },
            { name: 'Chuỗi rỗng', args: [''], expected: true }
        ]
    },
    'postfix-eval': {
        title: 'Tính giá trị biểu thức hậu tố (RPN)',
        prompt: 'Cho mảng token `tokens` (ví dụ `["2", "1", "+", "3", "*"]`). Tính và trả về giá trị số nguyên của biểu thức hậu tố (hỗ trợ `+`, `-`, `*`, `/`).',
        fnName: 'evalPostfix',
        starter: `static int evalPostfix(String[] tokens) {\n    let stack = [];\n    for (int i = 0; i < tokens.length; i++) {\n        let t = tokens[i];\n        // TODO: nếu là toán tử thì pop b rồi pop a, tính a op b rồi push lại; ngược lại push số\n        \n    }\n    return stack.pop();\n}`,
        solution: `static int evalPostfix(String[] tokens) {\n    let stack = [];\n    for (int i = 0; i < tokens.length; i++) {\n        let t = tokens[i];\n        if (t == '+' || t == '-' || t == '*' || t == '/') {\n            let b = stack.pop();\n            let a = stack.pop();\n            if (t == '+') stack.push(a + b);\n            else if (t == '-') stack.push(a - b);\n            else if (t == '*') stack.push(a * b);\n            else stack.push(Math.trunc(a / b));\n        } else {\n            stack.push(Number(t));\n        }\n    }\n    return stack.pop();\n}`,
        hint: 'Chú ý thứ tự pop: phần tử pop ra đầu tiên là toán hạng phải `b`, phần tử pop thứ hai là toán hạng trái `a` (quan trọng với `-` và `/`).',
        tests: [
            { name: '(2 + 1) * 3', args: [['2', '1', '+', '3', '*']], expected: 9 },
            { name: '10 - (6 / 2)', args: [['10', '6', '2', '/', '-']], expected: 7 },
            { name: 'Một số', args: [['42']], expected: 42 }
        ]
    },
    'palindrome-stack-queue': {
        title: 'Kiểm tra Palindrome',
        prompt: 'Kiểm tra chuỗi `s` có đối xứng hay không (bỏ qua khoảng trắng, không phân biệt chữ hoa/thường).',
        fnName: 'isPalindrome',
        starter: `static boolean isPalindrome(String s) {\n    let clean = s.toLowerCase().replace(/\\s+/g, '');\n    // TODO: kiểm tra đối xứng bằng stack/queue hoặc hai con trỏ\n    \n    return true;\n}`,
        solution: `static boolean isPalindrome(String s) {\n    let clean = s.toLowerCase().replace(/\\s+/g, '');\n    let stack = [];\n    let queue = [];\n    for (int i = 0; i < clean.length(); i++) {\n        stack.push(clean.charAt(i));\n        queue.push(clean.charAt(i));\n    }\n    while (stack.length > 0) {\n        if (stack.pop() !== queue.shift()) return false;\n    }\n    return true;\n}`,
        hint: 'Push mọi ký tự vào cả stack và queue, sau đó so sánh từng cặp stack.pop() với queue.shift().',
        tests: [
            { name: 'Chuỗi đối xứng có dấu cách', args: ['A man a plan a canal Panama'], expected: true },
            { name: 'Không đối xứng', args: ['hello'], expected: false },
            { name: 'Chuỗi rỗng', args: [''], expected: true }
        ]
    },
    'stack-adt': {
        title: 'Thực hành thao tác Stack',
        prompt: 'Cho mảng lệnh `ops` gồm `"push X"`, `"pop"`, `"top"`. Thực thi tuần tự trên một Stack ban đầu rỗng và trả về mảng kết quả của các lệnh `"top"` và `"pop"` (bỏ qua nếu stack rỗng).',
        fnName: 'runStackOps',
        starter: `static int[] runStackOps(String[] ops) {\n    let stack = [];\n    let out = [];\n    // TODO: xử lý push X, pop, top\n    \n    return out;\n}`,
        solution: `static int[] runStackOps(String[] ops) {\n    let stack = [];\n    let out = [];\n    for (int i = 0; i < ops.length; i++) {\n        let op = ops[i];\n        if (op.startsWith('push ')) {\n            stack.push(Number(op.slice(5)));\n        } else if (op == 'pop') {\n            if (stack.length > 0) out.push(stack.pop());\n        } else if (op == 'top') {\n            if (stack.length > 0) out.push(stack[stack.length - 1]);\n        }\n    }\n    return out;\n}`,
        hint: 'top chỉ đọc stack[stack.length - 1] mà không xóa; pop vừa lấy vừa xóa phần tử đỉnh.',
        tests: [
            { name: 'Chuỗi thao tác chuẩn', args: [['push 10', 'push 20', 'top', 'pop', 'pop']], expected: [20, 20, 10] },
            { name: 'Pop khi rỗng', args: [['pop', 'push 5', 'top']], expected: [5] }
        ]
    },
    'queue-adt': {
        title: 'Thực hành thao tác Queue (FIFO)',
        prompt: 'Cho mảng lệnh `ops` gồm `"enq X"` và `"deq"`. Thực thi theo quy tắc FIFO và trả về mảng các giá trị lấy ra bởi `"deq"`.',
        fnName: 'runQueueOps',
        starter: `static int[] runQueueOps(String[] ops) {\n    let q = [];\n    let out = [];\n    // TODO: xử lý enq X và deq\n    \n    return out;\n}`,
        solution: `static int[] runQueueOps(String[] ops) {\n    let q = [];\n    let out = [];\n    for (int i = 0; i < ops.length; i++) {\n        let op = ops[i];\n        if (op.startsWith('enq ')) q.push(Number(op.slice(4)));\n        else if (op == 'deq' && q.length > 0) out.push(q.shift());\n    }\n    return out;\n}`,
        hint: 'enq thêm vào cuối hàng đợi (push), deq lấy ở đầu hàng đợi (shift).',
        tests: [
            { name: 'Thứ tự FIFO', args: [['enq 1', 'enq 2', 'deq', 'enq 3', 'deq', 'deq']], expected: [1, 2, 3] },
            { name: 'Hàng đợi rỗng', args: [['deq', 'enq 9', 'deq']], expected: [9] }
        ]
    },
    'circular-array-queue': {
        title: 'Cài đặt hàng đợi mảng vòng',
        prompt: 'Cho sức chứa `cap` và mảng lệnh `"enq X"` / `"deq"`. Quản lý bằng mảng vòng kích thước `cap` với `front`, `size` (bỏ qua `enq` nếu đầy). Trả về các giá trị đã `deq`.',
        fnName: 'circularQueueOps',
        starter: `static int[] circularQueueOps(int cap, String[] ops) {\n    int[] data = new int[cap];\n    int front = 0, size = 0;\n    let out = [];\n    // TODO: dùng công thức (front + size) % cap và (front + 1) % cap\n    \n    return out;\n}`,
        solution: `static int[] circularQueueOps(int cap, String[] ops) {\n    int[] data = new int[cap];\n    int front = 0, size = 0;\n    let out = [];\n    for (int i = 0; i < ops.length; i++) {\n        let op = ops[i];\n        if (op.startsWith('enq ')) {\n            if (size < cap) {\n                int rear = (front + size) % cap;\n                data[rear] = Number(op.slice(4));\n                size++;\n            }\n        } else if (op == 'deq' && size > 0) {\n            out.push(data[front]);\n            front = (front + 1) % cap;\n            size--;\n        }\n    }\n    return out;\n}`,
        hint: 'Vị trí ghi mới là (front + size) % cap. Khi lấy ra: đọc data[front], cập nhật front = (front + 1) % cap và size--.',
        tests: [
            { name: 'Quay vòng chỉ số', args: [3, ['enq 1', 'enq 2', 'deq', 'enq 3', 'enq 4', 'enq 5', 'deq', 'deq', 'deq']], expected: [1, 2, 3, 4] }
        ]
    },
    'array-list': {
        title: 'Chèn phần tử vào danh sách mảng',
        prompt: 'Chèn giá trị `val` vào vị trí `idx` trong mảng `a` (giả sử `0 <= idx <= a.length`) bằng cách dịch các phần tử từ `idx` sang phải 1 ô, trả về mảng mới.',
        fnName: 'insertAt',
        starter: `static int[] insertAt(int[] a, int idx, int val) {\n    int[] res = new int[a.length + 1];\n    // TODO: chép phần trước idx, đặt val, dịch phần còn lại sang phải\n    \n    return res;\n}`,
        solution: `static int[] insertAt(int[] a, int idx, int val) {\n    int[] res = new int[a.length + 1];\n    for (int i = 0; i < idx; i++) res[i] = a[i];\n    res[idx] = val;\n    for (int i = idx; i < a.length; i++) res[i + 1] = a[i];\n    return res;\n}`,
        hint: 'Chép a[0..idx-1] vào res[0..idx-1], gán res[idx] = val, rồi chép a[idx..n-1] vào res[idx+1..n].',
        tests: [
            { name: 'Chèn vào giữa', args: [[10, 20, 30, 40], 2, 99], expected: [10, 20, 99, 30, 40] },
            { name: 'Chèn vào đầu', args: [[1, 2], 0, 5], expected: [5, 1, 2] },
            { name: 'Mảng rỗng', args: [[], 0, 7], expected: [7] }
        ]
    },
    'fibonacci': {
        title: 'Tính số Fibonacci thứ n trong O(n)',
        prompt: 'Tính số Fibonacci `F(n)` với `F(0) = 0, F(1) = 1` bằng phương pháp lặp (hoặc ghi nhớ) để tránh bùng nổ $O(2^n)$.',
        fnName: 'fib',
        starter: `static int fib(int n) {\n    if (n <= 1) return n;\n    // TODO: dùng hai biến prev, curr cập nhật từ 2 đến n\n    \n    return 0;\n}`,
        solution: `static int fib(int n) {\n    if (n <= 1) return n;\n    int prev = 0, curr = 1;\n    for (int i = 2; i <= n; i++) {\n        int next = prev + curr;\n        prev = curr;\n        curr = next;\n    }\n    return curr;\n}`,
        hint: 'Khởi tạo prev = 0, curr = 1; mỗi bước tính next = prev + curr, gán prev = curr, curr = next.',
        tests: [
            { name: 'F(0)', args: [0], expected: 0 },
            { name: 'F(1)', args: [1], expected: 1 },
            { name: 'F(10)', args: [10], expected: 55 },
            { name: 'F(30)', args: [30], expected: 832040 }
        ]
    },
    'string-matching-bf': {
        title: 'Tìm kiếm xâu vét cạn',
        prompt: 'Tìm vị trí xuất hiện đầu tiên của xâu mẫu `pattern` trong xâu `text`, trả về `-1` nếu không có (không dùng `indexOf`).',
        fnName: 'findSubstring',
        starter: `static int findSubstring(String text, String pattern) {\n    int n = text.length(), m = pattern.length();\n    if (m == 0) return 0;\n    // TODO: thử mọi vị trí i từ 0 đến n - m\n    \n    return -1;\n}`,
        solution: `static int findSubstring(String text, String pattern) {\n    int n = text.length(), m = pattern.length();\n    if (m == 0) return 0;\n    for (int i = 0; i <= n - m; i++) {\n        int j = 0;\n        while (j < m && text.charAt(i + j) == pattern.charAt(j)) j++;\n        if (j == m) return i;\n    }\n    return -1;\n}`,
        hint: 'Tại mỗi i từ 0 đến n - m, so khớp lần lượt j từ 0; nếu khớp đủ m ký tự thì trả về i.',
        tests: [
            { name: 'Tìm thấy ở giữa', args: ['ababcabcabababd', 'ababd'], expected: 10 },
            { name: 'Không tìm thấy', args: ['abcdef', 'gh'], expected: -1 },
            { name: 'Mẫu rỗng', args: ['abc', ''], expected: 0 }
        ]
    },
    'binary-strings': {
        title: 'Sinh xâu nhị phân độ dài n bằng quay lui',
        prompt: 'Trả về mảng các xâu nhị phân độ dài `n` theo thứ tự từ điển tăng dần (ví dụ `n = 2` → `["00", "01", "10", "11"]`).',
        fnName: 'generateBinaryStrings',
        starter: `static String[] generateBinaryStrings(int n) {\n    let res = [];\n    function backtrack(cur) {\n        if (cur.length == n) { res.push(cur); return; }\n        // TODO: thử thêm '0' rồi '1'\n        \n    }\n    backtrack('');\n    return res;\n}`,
        solution: `static String[] generateBinaryStrings(int n) {\n    let res = [];\n    function backtrack(cur) {\n        if (cur.length == n) { res.push(cur); return; }\n        backtrack(cur + '0');\n        backtrack(cur + '1');\n    }\n    backtrack('');\n    return res;\n}`,
        hint: 'Gọi backtrack(cur + "0") trước backtrack(cur + "1") để kết quả tự động theo thứ tự từ điển.',
        tests: [
            { name: 'n = 2', args: [2], expected: ['00', '01', '10', '11'] },
            { name: 'n = 0', args: [0], expected: [''] }
        ]
    },
    'n-queens': {
        title: 'Đếm số nghiệm bài toán N hậu',
        prompt: 'Đếm số cách đặt `n` quân hậu trên bàn cờ `n x n` sao cho không hai quân nào cùng hàng, cột hoặc đường chéo.',
        fnName: 'countNQueens',
        starter: `static int countNQueens(int n) {\n    let cols = new Array(n).fill(false);\n    let diag1 = new Array(2 * n).fill(false);\n    let diag2 = new Array(2 * n).fill(false);\n    int count = 0;\n    function dfs(row) {\n        if (row == n) { count++; return; }\n        // TODO: thử từng cột c, kiểm tra cols[c], diag1[row - c + n], diag2[row + c]\n        \n    }\n    dfs(0);\n    return count;\n}`,
        solution: `static int countNQueens(int n) {\n    let cols = new Array(n).fill(false);\n    let diag1 = new Array(2 * n).fill(false);\n    let diag2 = new Array(2 * n).fill(false);\n    int count = 0;\n    function dfs(row) {\n        if (row == n) { count++; return; }\n        for (int c = 0; c < n; c++) {\n            int d1 = row - c + n, d2 = row + c;\n            if (cols[c] || diag1[d1] || diag2[d2]) continue;\n            cols[c] = diag1[d1] = diag2[d2] = true;\n            dfs(row + 1);\n            cols[c] = diag1[d1] = diag2[d2] = false;\n        }\n    }\n    dfs(0);\n    return count;\n}`,
        hint: 'Đặt hậu xong gọi dfs(row + 1), sau đó nhớ bỏ đánh dấu (backtrack) trước khi sang cột tiếp theo.',
        tests: [
            { name: 'n = 4', args: [4], expected: 2 },
            { name: 'n = 8', args: [8], expected: 92 },
            { name: 'n = 2 (vô nghiệm)', args: [2], expected: 0 }
        ]
    },
    'coin-change-greedy': {
        title: 'Đổi tiền tham lam',
        prompt: 'Cho mảng mệnh giá `coins` (ví dụ `[25, 10, 5, 1]`) và số tiền `amount`. Chọn ít đồng nhất theo chiến lược tham lam (luôn lấy đồng lớn nhất không vượt quá phần còn lại). Trả về số đồng hoặc `-1` nếu không đổi hết.',
        fnName: 'greedyCoinChange',
        starter: `static int greedyCoinChange(int[] coins, int amount) {\n    Arrays.sort(coins);\n    int count = 0;\n    // TODO: duyệt từ mệnh giá lớn nhất về nhỏ nhất\n    \n    return amount == 0 ? count : -1;\n}`,
        solution: `static int greedyCoinChange(int[] coins, int amount) {\n    Arrays.sort(coins);\n    int count = 0;\n    for (int i = coins.length - 1; i >= 0; i--) {\n        if (coins[i] <= 0) continue;\n        int take = Math.floor(amount / coins[i]);\n        count += take;\n        amount -= take * coins[i];\n    }\n    return amount == 0 ? count : -1;\n}`,
        hint: 'Duyệt ngược từ i = coins.length - 1 về 0, lấy Math.floor(amount / coins[i]) đồng rồi trừ vào amount.',
        tests: [
            { name: 'Đổi 63 xu hệ Mỹ', args: [[1, 5, 10, 25], 63], expected: 6 },
            { name: 'Không đổi hết', args: [[5, 10], 7], expected: -1 },
            { name: 'Số tiền 0', args: [[1, 5], 0], expected: 0 }
        ]
    },
    'activity-selection': {
        title: 'Chọn hoạt động không giao nhau',
        prompt: 'Cho mảng các khoảng `[start, end]`. Trả về số lượng tối đa các hoạt động không chồng lấn (cho phép `start >= prevEnd`).',
        fnName: 'maxActivities',
        starter: `static int maxActivities(int[][] intervals) {\n    intervals.sort((a, b) => a[1] - b[1]);\n    int count = 0, lastEnd = -Infinity;\n    // TODO: duyệt từng khoảng đã sắp theo giờ kết thúc\n    \n    return count;\n}`,
        solution: `static int maxActivities(int[][] intervals) {\n    intervals.sort((a, b) => a[1] - b[1]);\n    int count = 0, lastEnd = -Infinity;\n    for (int i = 0; i < intervals.length; i++) {\n        if (intervals[i][0] >= lastEnd) {\n            count++;\n            lastEnd = intervals[i][1];\n        }\n    }\n    return count;\n}`,
        hint: 'Vì đã sắp theo end tăng dần, chỉ cần kiểm tra intervals[i][0] >= lastEnd thì chọn và cập nhật lastEnd = intervals[i][1].',
        tests: [
            { name: '6 hoạt động', args: [[[1, 4], [3, 5], [0, 6], [5, 7], [8, 9], [5, 9]]], expected: 3 },
            { name: 'Rỗng', args: [[]], expected: 0 }
        ]
    },
    'binomial-dp': {
        title: 'Tính hệ số nhị thức C(n, k) bằng DP',
        prompt: 'Tính tổ hợp chập `k` của `n` bằng bảng Pascal (quy hoạch động), tránh tràn giai thừa.',
        fnName: 'binomialDP',
        starter: `static int binomialDP(int n, int k) {\n    if (k < 0 || k > n) return 0;\n    int[] dp = new int[k + 1];\n    dp[0] = 1;\n    // TODO: cập nhật dp[j] += dp[j - 1] theo thứ tự j giảm dần\n    \n    return dp[k];\n}`,
        solution: `static int binomialDP(int n, int k) {\n    if (k < 0 || k > n) return 0;\n    int[] dp = new int[k + 1];\n    dp[0] = 1;\n    for (int i = 1; i <= n; i++) {\n        for (int j = Math.min(i, k); j >= 1; j--) {\n            dp[j] = dp[j] + dp[j - 1];\n        }\n    }\n    return dp[k];\n}`,
        hint: 'Khi dùng mảng 1D, phải duyệt j từ Math.min(i, k) giảm về 1 để không ghi đè dp[j - 1] của hàng trước.',
        tests: [
            { name: 'C(5, 2)', args: [5, 2], expected: 10 },
            { name: 'C(10, 0)', args: [10, 0], expected: 1 },
            { name: 'C(10, 4)', args: [10, 4], expected: 210 }
        ]
    },
    'lis': {
        title: 'Độ dài dãy con tăng dài nhất (LIS)',
        prompt: 'Cho mảng `a`. Tìm độ dài dãy con tăng nghiêm ngặt dài nhất bằng quy hoạch động $O(n^2)$.',
        fnName: 'lengthOfLIS',
        starter: `static int lengthOfLIS(int[] a) {\n    if (a.length == 0) return 0;\n    int[] L = new int[a.length];\n    int best = 1;\n    // TODO: L[i] = 1 + max(L[j]) với j < i và a[j] < a[i]\n    \n    return best;\n}`,
        solution: `static int lengthOfLIS(int[] a) {\n    if (a.length == 0) return 0;\n    int[] L = new int[a.length];\n    int best = 1;\n    for (int i = 0; i < a.length; i++) {\n        L[i] = 1;\n        for (int j = 0; j < i; j++) {\n            if (a[j] < a[i] && L[j] + 1 > L[i]) L[i] = L[j] + 1;\n        }\n        if (L[i] > best) best = L[i];\n    }\n    return best;\n}`,
        hint: 'Khởi tạo L[i] = 1 cho mọi i (tức dãy chỉ gồm chính a[i]), rồi xét mọi j < i có a[j] < a[i].',
        tests: [
            { name: 'Dãy chuẩn', args: [[5, 2, 8, 6, 3, 6, 9, 7]], expected: 4 },
            { name: 'Mảng giảm dần', args: [[5, 4, 3, 2, 1]], expected: 1 },
            { name: 'Mảng rỗng', args: [[]], expected: 0 }
        ]
    },
    'knapsack-01': {
        title: 'Bài toán Cái túi 0-1',
        prompt: 'Cho mảng trọng lượng `w`, mảng giá trị `v`, và sức chứa `W`. Trả về tổng giá trị lớn nhất có thể mang (mỗi vật chọn tối đa 1 lần).',
        fnName: 'knapsack01',
        starter: `static int knapsack01(int[] w, int[] v, int W) {\n    int[] dp = new int[W + 1];\n    // TODO: với mỗi vật i, duyệt sức chứa c từ W giảm về w[i]\n    \n    return dp[W];\n}`,
        solution: `static int knapsack01(int[] w, int[] v, int W) {\n    int[] dp = new int[W + 1];\n    for (int i = 0; i < w.length; i++) {\n        for (int c = W; c >= w[i]; c--) {\n            dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]);\n        }\n    }\n    return dp[W];\n}`,
        hint: 'Duyệt c từ W xuống w[i] để mỗi vật chỉ được dùng tối đa một lần.',
        tests: [
            { name: '4 đồ vật, W = 7', args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
            { name: 'Không đủ sức chứa', args: [[5, 6], [10, 20], 3], expected: 0 }
        ]
    },
    'lcs': {
        title: 'Xâu con chung dài nhất (LCS)',
        prompt: 'Cho hai chuỗi `a` và `b`. Trả về độ dài xâu con chung dài nhất của chúng.',
        fnName: 'lcsLength',
        starter: `static int lcsLength(String a, String b) {\n    int m = a.length(), n = b.length();\n    int[][] dp = new int[m + 1][n + 1];\n    // TODO: điền bảng dp[i][j]\n    \n    return dp[m][n];\n}`,
        solution: `static int lcsLength(String a, String b) {\n    int m = a.length(), n = b.length();\n    int[][] dp = new int[m + 1][n + 1];\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;\n            else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[m][n];\n}`,
        hint: 'Nếu a[i-1] == b[j-1] thì lấy chéo dp[i-1][j-1] + 1; ngược lại lấy max(dp[i-1][j], dp[i][j-1]).',
        tests: [
            { name: 'ABCBDAB và BDCABA', args: ['ABCBDAB', 'BDCABA'], expected: 4 },
            { name: 'Không trùng ký tự', args: ['abc', 'xyz'], expected: 0 },
            { name: 'Một chuỗi rỗng', args: ['', 'abc'], expected: 0 }
        ]
    },
    'grid-path-dp': {
        title: 'Đếm đường đi trên lưới m x n',
        prompt: 'Từ ô `(0, 0)` chỉ được đi sang phải hoặc xuống dưới. Trả về số đường đi đến `(m - 1, n - 1)`.',
        fnName: 'countPaths',
        starter: `static int countPaths(int m, int n) {\n    int[][] dp = new int[m][n];\n    // TODO: hàng 0 và cột 0 bằng 1, các ô khác bằng tổng ô trên và ô trái\n    \n    return dp[m - 1][n - 1];\n}`,
        solution: `static int countPaths(int m, int n) {\n    int[][] dp = new int[m][n];\n    for (int i = 0; i < m; i++) dp[i][0] = 1;\n    for (int j = 0; j < n; j++) dp[0][j] = 1;\n    for (int i = 1; i < m; i++) {\n        for (int j = 1; j < n; j++) {\n            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n        }\n    }\n    return dp[m - 1][n - 1];\n}`,
        hint: 'Khởi tạo hàng 0 và cột 0 bằng 1 vì chỉ có đúng 1 cách đi thẳng tới các ô biên.',
        tests: [
            { name: 'Lưới 3x3', args: [3, 3], expected: 6 },
            { name: 'Lưới 1x5', args: [1, 5], expected: 1 },
            { name: 'Lưới 3x7', args: [3, 7], expected: 28 }
        ]
    },
    'dfs': {
        title: 'Duyệt đồ thị theo chiều sâu (DFS)',
        prompt: 'Cho danh sách kề `adj` (`adj[u]` là mảng các đỉnh kề của `u` theo thứ tự) và đỉnh bắt đầu `start`. Trả về mảng thứ tự các đỉnh được thăm bởi DFS.',
        fnName: 'dfsOrder',
        starter: `static int[] dfsOrder(int[][] adj, int start) {\n    boolean[] visited = new boolean[adj.length];\n    let order = [];\n    function dfs(u) {\n        // TODO: đánh dấu visited[u], ghi vào order, duyệt các đỉnh kề chưa thăm\n        \n    }\n    dfs(start);\n    return order;\n}`,
        solution: `static int[] dfsOrder(int[][] adj, int start) {\n    boolean[] visited = new boolean[adj.length];\n    let order = [];\n    function dfs(u) {\n        visited[u] = true;\n        order.push(u);\n        for (int i = 0; i < adj[u].length; i++) {\n            int v = adj[u][i];\n            if (!visited[v]) dfs(v);\n        }\n    }\n    dfs(start);\n    return order;\n}`,
        hint: 'Đánh dấu visited[u] = true ngay khi vào dfs(u) để tránh lặp vô hạn khi đồ thị có chu trình.',
        tests: [
            { name: 'Đồ thị 5 đỉnh có chu trình', args: [[[1, 2], [0, 3], [0, 4], [1], [2]], 0], expected: [0, 1, 3, 2, 4] },
            { name: 'Đồ thị 1 đỉnh', args: [[[]], 0], expected: [0] }
        ]
    },
    'bfs': {
        title: 'Khoảng cách ngắn nhất bằng BFS',
        prompt: 'Cho danh sách kề `adj` (đồ thị không trọng số) và đỉnh `start`. Trả về mảng `dist` là số cạnh ngắn nhất từ `start` đến mỗi đỉnh (`-1` nếu không tới được).',
        fnName: 'bfsDistances',
        starter: `static int[] bfsDistances(int[][] adj, int start) {\n    int n = adj.length;\n    int[] dist = new int[n];\n    Arrays.fill(dist, -1);\n    let q = [];\n    // TODO: khởi tạo dist[start] = 0, đưa vào q, lan tỏa theo từng lớp\n    \n    return dist;\n}`,
        solution: `static int[] bfsDistances(int[][] adj, int start) {\n    int n = adj.length;\n    int[] dist = new int[n];\n    Arrays.fill(dist, -1);\n    let q = [start];\n    dist[start] = 0;\n    for (int head = 0; head < q.length; head++) {\n        int u = q[head];\n        for (int i = 0; i < adj[u].length; i++) {\n            int v = adj[u][i];\n            if (dist[v] == -1) {\n                dist[v] = dist[u] + 1;\n                q.push(v);\n            }\n        }\n    }\n    return dist;\n}`,
        hint: 'Cập nhật dist[v] = dist[u] + 1 ngay lúc đẩy v vào hàng đợi để không đẩy cùng một đỉnh nhiều lần.',
        tests: [
            { name: 'Đồ thị 5 đỉnh', args: [[[1, 2], [0, 3], [0, 3], [1, 2, 4], [3]], 0], expected: [0, 1, 1, 2, 3] },
            { name: 'Đỉnh cô lập', args: [[[1], [0], []], 0], expected: [0, 1, -1] }
        ]
    },
    'dijkstra': {
        title: 'Thuật toán Dijkstra tìm đường đi ngắn nhất',
        prompt: 'Cho ma trận trọng số `graph` (`graph[u][v] = 0` nếu không có cạnh, `> 0` nếu có cạnh) và đỉnh `src`. Trả về mảng khoảng cách ngắn nhất từ `src` đến mọi đỉnh (`Infinity` nếu không tới được).',
        fnName: 'dijkstra',
        starter: `static int[] dijkstra(int[][] graph, int src) {\n    int n = graph.length;\n    int[] dist = new int[n];\n    boolean[] used = new boolean[n];\n    Arrays.fill(dist, Infinity);\n    dist[src] = 0;\n    // TODO: lặp n lần, chọn đỉnh u chưa dùng có dist[u] nhỏ nhất rồi nới lỏng các cạnh (u, v)\n    \n    return dist;\n}`,
        solution: `static int[] dijkstra(int[][] graph, int src) {\n    int n = graph.length;\n    int[] dist = new int[n];\n    boolean[] used = new boolean[n];\n    Arrays.fill(dist, Infinity);\n    dist[src] = 0;\n    for (int step = 0; step < n; step++) {\n        int u = -1;\n        for (int i = 0; i < n; i++) {\n            if (!used[i] && (u == -1 || dist[i] < dist[u])) u = i;\n        }\n        if (u == -1 || dist[u] == Infinity) break;\n        used[u] = true;\n        for (int v = 0; v < n; v++) {\n            if (graph[u][v] > 0 && dist[u] + graph[u][v] < dist[v]) {\n                dist[v] = dist[u] + graph[u][v];\n            }\n        }\n    }\n    return dist;\n}`,
        hint: 'Mỗi bước chọn u chưa đánh dấu có dist[u] nhỏ nhất, đánh dấu used[u] = true, rồi kiểm tra dist[u] + graph[u][v] < dist[v].',
        tests: [
            {
                name: 'Đồ thị 4 đỉnh có hướng',
                args: [[[0, 4, 1, 0], [0, 0, 0, 1], [0, 2, 0, 5], [0, 0, 0, 0]], 0],
                expected: [0, 3, 1, 4]
            }
        ]
    },
    'heap-insert': {
        title: 'Chèn phần tử vào Min-Heap (siftUp)',
        prompt: 'Cho mảng `heap` đang thỏa mãn tính chất Min-Heap (chỉ số 0 là gốc). Chèn giá trị `val` vào cuối rồi đẩy lên (`siftUp`) để khôi phục Min-Heap.',
        fnName: 'heapInsert',
        inPlace: true,
        starter: `static int[] heapInsert(int[] heap, int val) {\n    heap.push(val);\n    int i = heap.length - 1;\n    // TODO: khi i > 0 và heap[i] < heap[parent], đổi chỗ với cha (Math.floor((i - 1) / 2))\n    \n    return heap;\n}`,
        solution: `static int[] heapInsert(int[] heap, int val) {\n    heap.push(val);\n    int i = heap.length - 1;\n    while (i > 0) {\n        int p = Math.floor((i - 1) / 2);\n        if (heap[i] >= heap[p]) break;\n        int t = heap[i]; heap[i] = heap[p]; heap[p] = t;\n        i = p;\n    }\n    return heap;\n}`,
        hint: 'Với gốc ở chỉ số 0, chỉ số cha của nút i là Math.floor((i - 1) / 2).',
        tests: [
            { name: 'Chèn phần tử nhỏ nhất mới', args: [[3, 5, 8, 10, 7], 2], expected: [2, 5, 3, 10, 7, 8] },
            { name: 'Heap rỗng', args: [[], 9], expected: [9] }
        ]
    }
};

export function hasCodingLab(pieceId) {
    return Object.hasOwn(CHALLENGES, pieceId);
}

export function mountCodingLab(host, piece) {
    const ch = CHALLENGES[piece.id];
    if (!ch || !host) return;

    const saved = readStorage(CODE_KEY_PREFIX + piece.id, null);
    const solved = loadSolvedSet().has(piece.id);

    host.hidden = false;
    host.innerHTML = `
        <div class="viz-header">
            <div>
                <div class="viz-title-row">
                    <h3>Thực hành viết &amp; chạy code: ${ch.title}</h3>
                    <span class="viz-badge ${solved ? 'solved' : ''}" id="coding-status-badge">${solved ? 'Đã vượt qua ✓' : 'Thử thách Code'}</span>
                </div>
                <p class="viz-subtitle">${ch.prompt.replace(/`([^`]+)`/g, '<code>$1</code>')}</p>
            </div>
        </div>
        <div class="coding-editor-wrap">
            <div class="coding-toolbar">
                <span>Hỗ trợ cú pháp Java cơ bản / JS · Hàm mục tiêu: <code>${ch.fnName}</code></span>
                <span>Ctrl + Enter để chạy</span>
            </div>
            <textarea id="coding-editor" class="coding-editor" spellcheck="false" aria-label="Trình soạn thảo code thực hành"></textarea>
        </div>
        <div class="coding-actions">
            <button type="button" id="run-tests-btn" class="viz-btn primary">▶ Chạy kiểm thử (${ch.tests.length} test)</button>
            <button type="button" id="hint-code-btn" class="viz-btn">💡 Gợi ý</button>
            <button type="button" id="reset-code-btn" class="viz-btn">↺ Khôi phục khung</button>
            <button type="button" id="solution-code-btn" class="viz-btn">👁 Đáp án mẫu</button>
        </div>
        <p id="coding-hint-box" class="coding-hint" hidden></p>
        <div id="coding-results" class="coding-results" aria-live="polite"></div>
    `;

    const editor = host.querySelector('#coding-editor');
    const resultsEl = host.querySelector('#coding-results');
    const hintBox = host.querySelector('#coding-hint-box');
    const badgeEl = host.querySelector('#coding-status-badge');

    editor.value = saved !== null ? saved : ch.starter;

    editor.addEventListener('input', () => {
        writeStorage(CODE_KEY_PREFIX + piece.id, editor.value);
    });

    editor.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.slice(0, start) + '    ' + editor.value.slice(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
            writeStorage(CODE_KEY_PREFIX + piece.id, editor.value);
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runTests();
        }
    });

    function runTests() {
        const res = runChallengeTests(ch, editor.value);
        if (res.error) {
            resultsEl.innerHTML = `<div class="coding-error">${res.error.replace(/</g, '&lt;')}</div>`;
            return;
        }
        const passed = res.results.filter(r => r.pass).length;
        if (res.ok) {
            markSolved(piece.id);
            badgeEl.textContent = 'Đã vượt qua ✓';
            badgeEl.classList.add('solved');
        }
        resultsEl.innerHTML = `
            <div class="coding-summary ${res.ok ? 'pass' : 'fail'}">
                <strong>${res.ok ? `Xuất sắc! Đạt ${passed}/${res.results.length} test case.` : `Đạt ${passed}/${res.results.length} test case. Hãy kiểm tra lại các trường hợp chưa đạt:`}</strong>
            </div>
            <div class="coding-case-list">
                ${res.results.map(r => `
                    <div class="coding-case ${r.pass ? 'pass' : 'fail'}">
                        <div class="coding-case-head">
                            <span>${r.pass ? '✓' : '✗'} ${r.name}</span>
                            <span>${r.pass ? 'PASS' : 'FAIL'}</span>
                        </div>
                        <div class="coding-case-meta">
                            <div><strong>Đầu vào:</strong> <code>${r.input.replace(/</g, '&lt;')}</code></div>
                            <div><strong>Kỳ vọng:</strong> <code>${r.expected.replace(/</g, '&lt;')}</code></div>
                            ${r.pass ? '' : `<div><strong>Thực tế:</strong> <code>${(r.error || r.actual).replace(/</g, '&lt;')}</code></div>`}
                        </div>
                    </div>
                `).join('')}
            </div>
            ${res.logs.length ? `<pre class="viz-code-trace">${res.logs.join('\n').replace(/</g, '&lt;')}</pre>` : ''}
        `;
    }

    host.querySelector('#run-tests-btn').addEventListener('click', runTests);
    host.querySelector('#hint-code-btn').addEventListener('click', () => {
        hintBox.hidden = !hintBox.hidden;
        if (!hintBox.hidden) hintBox.textContent = `Gợi ý: ${ch.hint}`;
    });
    host.querySelector('#reset-code-btn').addEventListener('click', () => {
        editor.value = ch.starter;
        writeStorage(CODE_KEY_PREFIX + piece.id, ch.starter);
        resultsEl.innerHTML = '';
    });
    host.querySelector('#solution-code-btn').addEventListener('click', () => {
        editor.value = ch.solution;
        writeStorage(CODE_KEY_PREFIX + piece.id, ch.solution);
    });
}
