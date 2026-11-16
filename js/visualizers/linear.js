import { createStepper, el, renderCells, renderLinkedList } from './shared.js';

function makeBracketSteps(expr) {
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };
    const openSet = new Set(['(', '[', '{']);
    const chars = [...expr];
    const steps = [{ chars, idx: -1, stack: [], status: 'init', msg: `Kiểm tra cân bằng ngoặc cho chuỗi "${expr}" bằng Stack.` }];

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (openSet.has(ch)) {
            stack.push(ch);
            steps.push({ chars, idx: i, stack: [...stack], status: 'push', msg: `Gặp ngoặc mở '${ch}' tại [${i}] → push vào Stack.` });
        } else if (pairs[ch]) {
            if (!stack.length) {
                steps.push({ chars, idx: i, stack: [...stack], status: 'err', msg: `Lỗi tại [${i}] gặp '${ch}' nhưng Stack rỗng! Chuỗi không cân bằng.` });
                return steps;
            }
            const top = stack.pop();
            if (top !== pairs[ch]) {
                steps.push({ chars, idx: i, stack: [...stack], status: 'err', msg: `Không khớp! Đỉnh Stack là '${top}', không khớp với '${ch}'.` });
                return steps;
            }
            steps.push({ chars, idx: i, stack: [...stack], status: 'match', msg: `Gặp '${ch}' khớp với đỉnh Stack '${top}' → pop ra.` });
        } else {
            steps.push({ chars, idx: i, stack: [...stack], status: 'skip', msg: `Ký tự '${ch}' không phải dấu ngoặc → bỏ qua.` });
        }
    }
    if (stack.length) {
        steps.push({ chars, idx: chars.length, stack: [...stack], status: 'err', msg: `Hết chuỗi nhưng Stack vẫn còn ngoặc mở [${stack.join(', ')}] chưa đóng!` });
    } else {
        steps.push({ chars, idx: chars.length, stack: [], status: 'ok', msg: 'Hết chuỗi và Stack rỗng → Biểu thức hoàn toàn CÂN BẰNG!' });
    }
    return steps;
}

function makePostfixSteps(expr) {
    const tokens = expr.trim().split(/\s+/).filter(Boolean);
    const stack = [];
    const ops = new Set(['+', '-', '*', '/']);
    const steps = [{ tokens, idx: -1, stack: [], msg: `Đánh giá biểu thức hậu tố "${tokens.join(' ')}" từ trái sang phải bằng Stack.` }];

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (!ops.has(t)) {
            const val = Number(t);
            if (!Number.isFinite(val)) return [{ tokens, idx: i, stack: [], msg: `Token không hợp lệ: "${t}". Chỉ dùng số và + - * /.` }];
            stack.push(val);
            steps.push({ tokens, idx: i, stack: [...stack], msg: `Đọc toán hạng ${val} → push(${val}) vào Stack.` });
        } else {
            if (stack.length < 2) return [...steps, { tokens, idx: i, stack: [...stack], msg: `Lỗi: toán tử '${t}' cần 2 toán hạng trên Stack.` }];
            const b = stack.pop();
            const a = stack.pop();
            const res = t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : Math.trunc(a / b);
            stack.push(res);
            steps.push({ tokens, idx: i, stack: [...stack], msg: `Gặp '${t}': pop b=${b}, pop a=${a} (chú ý thứ tự a ${t} b = ${a} ${t} ${b} = ${res}) → push(${res}).` });
        }
    }
    const final = stack.length === 1 ? stack[0] : '?';
    steps.push({ tokens, idx: tokens.length, stack: [...stack], msg: `Hoàn tất! Giá trị biểu thức = ${final}.` });
    return steps;
}

function makePalindromeSteps(word) {
    const clean = (word || 'racecar').toLowerCase();
    const chars = [...clean];
    const stack = [];
    const queue = [];
    const steps = [{ chars, i: -1, stack: [], queue: [], matched: [], msg: `Nạp từng ký tự của "${clean}" đồng thời vào Stack (LIFO) và Queue (FIFO).` }];

    for (let i = 0; i < chars.length; i++) {
        stack.push(chars[i]);
        queue.push(chars[i]);
        steps.push({ chars, i, stack: [...stack], queue: [...queue], matched: [], msg: `Đọc '${chars[i]}': push vào Stack, enqueue vào Queue.` });
    }
    const sCopy = [...stack];
    const qCopy = [...queue];
    for (let i = 0; i < chars.length; i++) {
        const fromS = sCopy.pop();
        const fromQ = qCopy.shift();
        if (fromS !== fromQ) {
            steps.push({ chars, i, stack: [...sCopy], queue: [...qCopy], matched: [fromS, fromQ, false], msg: `pop Stack = '${fromS}' ≠ dequeue Queue = '${fromQ}' → KHÔNG phải Palindrome!` });
            return steps;
        }
        steps.push({ chars, i, stack: [...sCopy], queue: [...qCopy], matched: [fromS, fromQ, true], msg: `pop Stack = '${fromS}' == dequeue Queue = '${fromQ}' → Khớp!` });
    }
    steps.push({ chars, i: chars.length, stack: [], queue: [], matched: ['', '', true], msg: `Tất cả ký tự đối xứng khớp hoàn toàn → "${clean}" LÀ Palindrome!` });
    return steps;
}

export function mountLinear(host, piece) {
    const id = piece.id;

    if (id === 'abstraction-adt') {
        const steps = [
            { layer: 'client', msg: 'Lớp gọi (Client) chỉ nhìn thấy giao diện ADT: push(x), pop(), size() mà không cần biết bên dưới dùng mảng hay node.' },
            { layer: 'implA', msg: 'Cài đặt 1 — Array-based: lưu liên tiếp trong bộ nhớ, đổi được O(1) theo chỉ số nhưng phải nhân đôi mảng khi đầy.' },
            { layer: 'implB', msg: 'Cài đặt 2 — Linked-based: mỗi phần tử là một Node trỏ next, cấp phát động vừa khít, không bao giờ phải cấp lại cả mảng.' }
        ];
        createStepper(host, {
            title: 'Tách biệt Giao diện ADT vs Cài đặt (Implementation)',
            subtitle: 'Một hợp đồng ADT duy nhất có thể hoán đổi nhiều cấu trúc lưu trữ bên dưới.',
            steps,
            render: (stage, f) => {
                const cards = el('div', { class: 'viz-cards-grid' },
                    el('div', { class: `viz-mini-card ${f.layer === 'client' ? 'is-active' : ''}` }, el('strong', {}, '1. ADT (Giao diện)'), el('p', {}, 'Chỉ định nghĩa HÀNH VI: add(x), get(i), remove(i), isEmpty().')),
                    el('div', { class: `viz-mini-card ${f.layer === 'implA' ? 'is-active' : ''}` }, el('strong', {}, '2A. Cài bằng Mảng'), el('p', {}, '[10, 20, 30, _ ] — Truy cập O(1), mở rộng 2x.')),
                    el('div', { class: `viz-mini-card ${f.layer === 'implB' ? 'is-active' : ''}` }, el('strong', {}, '2B. Cài bằng Liên kết'), el('p', {}, 'head → 10 → 20 → 30 → ∅ — Không tốn vùng đệm thừa.'))
                );
                stage.append(cards);
            }
        });
        return;
    }

    if (id === 'list-adt' || id === 'array-list' || id === 'hw-list') {
        const capSteps = [
            { cap: 2, arr: [10], msg: 'Khởi tạo ArrayList với sức chứa ban đầu capacity = 2, add(10) vào [0].' },
            { cap: 2, arr: [10, 20], msg: 'add(20) vào [1]. Lúc này size == capacity == 2 (mảng đã đầy!).' },
            { cap: 4, arr: [10, 20, 30], resize: true, msg: 'add(30): mảng đầy → cấp phát mảng mới capacity = 4 (gấp đôi!), sao chép [10, 20], đặt 30 ở [2]. Nhờ nhân đôi nên amortized vẫn O(1).' },
            { cap: 4, arr: [10, 99, 20, 30], insertAt: 1, msg: 'insert(index=1, 99): phải dịch phải toàn bộ đoạn [1..2] sang [2..3] mất O(n) trước khi ghi 99 vào [1].' },
            { cap: 4, arr: [10, 20, 30], msg: 'remove(index=1): dịch trái đoạn [2..3] về [1..2] và giảm size về 3 (tránh rò rỉ bộ nhớ bằng gán null ô cuối).' }
        ];
        createStepper(host, {
            title: id === 'list-adt' ? 'Các thao tác trên List ADT' : id === 'hw-list' ? 'Thực hành List ADT: Chèn, Xóa & Mở rộng mảng động' : 'ArrayList & Cơ chế nhân đôi mảng động (2× Resize)',
            subtitle: 'get(i) O(1), chèn/xóa giữa mảng O(n) do dịch phần tử, add cuối đạt amortized O(1).',
            steps: capSteps,
            stats: f => [['size', f.arr.length], ['capacity', f.cap]],
            render: (stage, f) => {
                const slots = Array.from({ length: f.cap }, (_, i) => ({ val: i < f.arr.length ? f.arr[i] : '∅', sub: `[${i}]` }));
                const hi = {};
                if (f.insertAt != null) hi[f.insertAt] = 'found';
                else if (f.resize) hi[f.arr.length - 1] = 'active';
                renderCells(stage, slots, hi, f.resize ? 'Nhân đôi capacity: 2 → 4 rồi sao chép' : 'Bộ nhớ liên tiếp trong mảng nội bộ data[]');
            }
        });
        return;
    }

    if (id === 'linked-list' || id === 'linked-list-variants') {
        const isVariants = id === 'linked-list-variants';
        const steps = isVariants
            ? [
                { nodes: [10, 20, 30], active: 0, mode: 'singly', msg: 'Danh sách liên kết đơn (Singly): mỗi nút chỉ có 1 con trỏ next → chỉ duyệt một chiều.' },
                { nodes: [10, 20, 30], active: 1, mode: 'doubly', msg: 'Liên kết đôi (Doubly): mỗi nút có prev và next → lùi về nút trước O(1), xóa nút khi biết tham chiếu O(1).' },
                { nodes: [10, 20, 30], active: 2, mode: 'circular', msg: 'Liên kết vòng (Circular): nút cuối trỏ next ngược về head → tiện cho lập lịch Round-Robin.' }
            ]
            : [
                { nodes: [10, 20, 30], active: -1, msg: 'Danh sách hiện có: head → [10] → [20] → [30] → null.' },
                { nodes: [5, 10, 20, 30], active: 0, msg: 'Chèn đầu addFirst(5): tạo node(5), đặt node.next = head rồi cập nhật head = node. Tốn O(1) không cần dịch mảng!' },
                { nodes: [5, 10, 15, 20, 30], active: 2, msg: 'Chèn giữa sau node(10): tìm tới node(10) mất O(k), nối newNode.next = 10.next rồi 10.next = newNode.' },
                { nodes: [5, 10, 20, 30], active: 1, msg: 'Xóa node(15): chỉ cần bắc cầu 10.next = 10.next.next (hoàn tất nối dây không cần dịch bộ nhớ).' }
            ];
        createStepper(host, {
            title: isVariants ? 'Các biến thể: Đơn, Đôi (Doubly) & Vòng (Circular)' : 'Linked List: Nối và ngắt con trỏ O(1)',
            subtitle: isVariants ? 'Thêm con trỏ prev hoặc nối vòng tail.next = head giải quyết bài toán duyệt hai chiều / vòng tròn.' : 'Thứ tự nối con trỏ cực kỳ quan trọng để không làm mất phần đuôi danh sách.',
            steps,
            render: (stage, f) => renderLinkedList(stage, f.nodes, {
                activeIdx: f.active,
                doubly: f.mode === 'doubly',
                circular: f.mode === 'circular'
            })
        });
        return;
    }

    if (id === 'stack-adt') {
        const steps = [
            { stack: [], msg: 'Stack rỗng (LIFO — Vào sau, ra trước). Đỉnh stack ở trên cùng.' },
            { stack: [12], msg: 'push(12): đặt 12 lên đỉnh Stack.' },
            { stack: [12, 25], msg: 'push(25): đặt 25 lên trên 12.' },
            { stack: [12, 25, 40], msg: 'push(40): đỉnh Stack hiện tại là 40.' },
            { stack: [12, 25, 40], peek: true, msg: 'peek(): đọc đỉnh được 40 mà KHÔNG xóa khỏi Stack.' },
            { stack: [12, 25], msg: 'pop(): lấy 40 ra khỏi đỉnh; 25 trở lại làm đỉnh Stack.' },
            { stack: [12], msg: 'pop(): lấy 25 ra; còn lại 12 ở đáy.' }
        ];
        createStepper(host, {
            title: 'Stack ADT — Cơ chế LIFO (Last-In First-Out)',
            subtitle: 'Mọi thao tác push, pop, peek đều diễn ra tại đúng một đầu (đỉnh Stack) trong O(1).',
            steps,
            stats: f => [['size', f.stack.length], ['top', f.stack.length ? f.stack[f.stack.length - 1] : 'null']],
            render: (stage, f) => {
                const wrap = el('div', { class: 'viz-stack-wrap' });
                const col = el('div', { class: 'viz-stack-col' });
                if (!f.stack.length) col.append(el('span', { class: 'muted-text', text: '(rỗng)' }));
                f.stack.forEach((v, i) => col.append(el('div', { class: `viz-cell ${i === f.stack.length - 1 ? 'is-active' : ''}`, text: i === f.stack.length - 1 ? `${v} (top)` : String(v) })));
                wrap.append(col);
                stage.append(wrap);
            }
        });
        return;
    }

    if (id === 'bracket-matching') {
        let expr = '{[a+(b*c)]-d}';
        const inp = el('input', { type: 'text', value: expr, size: '20', 'aria-label': 'Biểu thức chứa ngoặc' });
        const btn = el('button', { type: 'button', class: 'viz-btn', text: 'Kiểm tra' });
        const stepper = createStepper(host, {
            title: 'Kiểm tra dấu ngoặc hợp lệ bằng Stack',
            subtitle: 'Gặp ngoặc mở → push; gặp ngoặc đóng → kiểm tra có khớp ngoặc trên đỉnh Stack không.',
            controlsNode: el('span', { style: { display: 'inline-flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }, el('label', {}, 'Biểu thức:', inp), btn),
            presets: [
                { label: 'Hợp lệ {[a+(b*c)]-d}', steps: () => makeBracketSteps('{[a+(b*c)]-d}') },
                { label: 'Sai thứ tự ([)]', steps: () => makeBracketSteps('([)]') },
                { label: 'Thiếu ngoặc đóng ((a+b)', steps: () => makeBracketSteps('((a+b)') }
            ],
            steps: makeBracketSteps(expr),
            render: (stage, f) => {
                const hi = {};
                if (f.idx >= 0 && f.idx < f.chars.length) hi[f.idx] = f.status === 'err' ? 'swap' : 'active';
                renderCells(stage, f.chars.map((c, i) => ({ val: c, sub: i })), hi, 'Ký tự đang quét');
                stage.append(el('p', { style: { marginTop: '12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', fontFamily: 'var(--font-mono)' }, text: `Stack hiện tại (đáy → đỉnh): [ ${f.stack.join('  ')} ]` }));
            }
        });
        const run = () => { expr = inp.value || '()'; stepper.update(makeBracketSteps(expr)); };
        btn.addEventListener('click', run);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
        return;
    }

    if (id === 'postfix-eval') {
        let expr = '3 4 + 2 * 7 /';
        const inp = el('input', { type: 'text', value: expr, size: '22', 'aria-label': 'Biểu thức hậu tố RPN' });
        const btn = el('button', { type: 'button', class: 'viz-btn', text: 'Tính thử' });
        const stepper = createStepper(host, {
            title: 'Đánh giá biểu thức hậu tố (RPN) bằng Stack',
            subtitle: 'Số → đẩy vào Stack. Toán tử → rút b rồi a (chú ý thứ tự a op b!) rồi đẩy kết quả lại Stack.',
            controlsNode: el('span', { style: { display: 'inline-flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }, el('label', {}, 'Hậu tố:', inp), btn),
            presets: [
                { label: '(3+4)*2/7  →  3 4 + 2 * 7 /', steps: () => makePostfixSteps('3 4 + 2 * 7 /') },
                { label: '10 - (2 * 3) → 10 2 3 * -', steps: () => makePostfixSteps('10 2 3 * -') }
            ],
            steps: makePostfixSteps(expr),
            render: (stage, f) => {
                const hi = {};
                if (f.idx >= 0 && f.idx < f.tokens.length) hi[f.idx] = 'active';
                renderCells(stage, f.tokens.map((t, i) => ({ val: t, sub: `tok[${i}]` })), hi, 'Dãy token RPN');
                stage.append(el('div', { style: { height: '10px' } }));
                renderCells(stage, f.stack.length ? f.stack.map((v, i) => ({ val: v, sub: i === f.stack.length - 1 ? 'top' : '' })) : [{ val: 'rỗng', sub: '' }], f.stack.length ? { [f.stack.length - 1]: 'found' } : {}, 'Nội dung Stack');
            }
        });
        const run = () => { expr = inp.value || '3 4 +'; stepper.update(makePostfixSteps(expr)); };
        btn.addEventListener('click', run);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
        return;
    }

    if (id === 'queue-adt' || id === 'circular-array-queue' || id === 'linked-queue') {
        const isCircular = id === 'circular-array-queue';
        const isLinked = id === 'linked-queue';
        if (isLinked) {
            const steps = [
                { nodes: [], msg: 'LinkedQueue rỗng: front = null, rear = null.' },
                { nodes: ['A'], active: 0, msg: 'enqueue("A"): vì rỗng nên cả front và rear cùng trỏ nút A.' },
                { nodes: ['A', 'B'], active: 1, msg: 'enqueue("B"): rear.next = B; rear = B (O(1) nhờ có con trỏ rear).' },
                { nodes: ['A', 'B', 'C'], active: 2, msg: 'enqueue("C"): rear.next = C; rear = C.' },
                { nodes: ['B', 'C'], active: 0, msg: 'dequeue(): lấy "A" tại front, gán front = front.next trong O(1).' }
            ];
            createStepper(host, {
                title: 'LinkedQueue với hai con trỏ front và rear',
                subtitle: 'Luôn giữ rear để enqueue ở cuối chỉ mất O(1) thay vì phải duyệt hết danh sách.',
                steps,
                render: (stage, f) => renderLinkedList(stage, f.nodes, { activeIdx: f.active, tailPointer: f.nodes.length > 0 })
            });
            return;
        }
        const cap = 5;
        const steps = [
            { buf: ['_', '_', '_', '_', '_'], front: 0, rear: 0, size: 0, msg: 'Mảng vòng capacity = 5: front = 0, rear = 0, size = 0.' },
            { buf: ['A', 'B', 'C', '_', '_'], front: 0, rear: 3, size: 3, msg: 'Sau 3 lần enqueue(A, B, C): front=0, rear=3, size=3.' },
            { buf: ['_', '_', 'C', '_', '_'], front: 2, rear: 3, size: 1, msg: 'dequeue() 2 lần lấy A, B: front nhích lên 2 (không dịch các phần tử còn lại!).' },
            { buf: ['_', '_', 'C', 'D', 'E'], front: 2, rear: 0, size: 3, msg: 'enqueue(D, E): rear = (4 + 1) % 5 = 0 — vòng ngược về chỉ số 0!' },
            { buf: ['F', '_', 'C', 'D', 'E'], front: 2, rear: 1, size: 4, msg: 'enqueue(F) ghi vào [0], rear = 1. Tận dụng triệt để ô trống đầu mảng.' }
        ];
        createStepper(host, {
            title: isCircular ? 'Circular Array Queue (Hàng đợi mảng vòng % N)' : 'Queue ADT — Cơ chế FIFO (Vào trước, ra trước)',
            subtitle: 'Dùng phép chia dư (idx + 1) % capacity để tái sử dụng các ô đã dequeue ở đầu mảng.',
            steps,
            stats: f => [['front', f.front], ['rear', f.rear], ['size / cap', `${f.size}/${cap}`]],
            render: (stage, f) => {
                const hi = {};
                if (f.size > 0) hi[f.front] = 'found';
                hi[f.rear] = 'active';
                renderCells(stage, f.buf.map((v, i) => ({ val: v, sub: `[${i}]${i === f.front && f.size > 0 ? ' F' : ''}${i === f.rear ? ' R' : ''}` })), hi, 'Bộ đệm vòng (F=front, R=rear tiếp theo)');
            }
        });
        return;
    }

    // palindrome-stack-queue
    let word = 'radar';
    const inp = el('input', { type: 'text', value: word, size: '16', 'aria-label': 'Nhập chuỗi kiểm tra Palindrome' });
    const btn = el('button', { type: 'button', class: 'viz-btn', text: 'Kiểm tra' });
    const stepper = createStepper(host, {
        title: 'Kiểm tra chuỗi đối xứng (Palindrome) bằng Stack + Queue',
        subtitle: 'Queue giữ nguyên thứ tự xuôi (FIFO), Stack đảo ngược thứ tự (LIFO) → khớp từng cặp là Palindrome.',
        controlsNode: el('span', { style: { display: 'inline-flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }, el('label', {}, 'Chuỗi:', inp), btn),
        presets: [
            { label: 'Đối xứng "radar"', steps: () => makePalindromeSteps('radar') },
            { label: 'Không đối xứng "hello"', steps: () => makePalindromeSteps('hello') }
        ],
        steps: makePalindromeSteps(word),
        render: (stage, f) => {
            renderCells(stage, f.chars.map((c, i) => ({ val: c, sub: `[${i}]` })), f.i >= 0 && f.i < f.chars.length ? { [f.i]: 'active' } : {}, 'Chuỗi vào');
            stage.append(el('p', {
                style: { marginTop: '12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px' },
                text: `Stack (LIFO): [${f.stack.join(' ')}]   |   Queue (FIFO): [${f.queue.join(' ')}]`
            }));
        }
    });
    const run = () => { word = (inp.value || 'radar').replace(/\s+/g, '').slice(0, 12); stepper.update(makePalindromeSteps(word)); };
    btn.addEventListener('click', run);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
}
