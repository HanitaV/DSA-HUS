import { createStepper, el, parseNumberList, renderBars, renderCells } from './shared.js';

function arrayInputControl(initial, onApply, extra = null) {
    const inp = el('input', { type: 'text', value: initial.join(', '), size: '24', 'aria-label': 'Nhập dãy số nguyên cách nhau bởi dấu phẩy' });
    const btn = el('button', { type: 'button', class: 'viz-btn', text: 'Áp dụng dãy' });
    const apply = () => onApply(parseNumberList(inp.value, initial, { min: -50, max: 99, maxLen: 10 }));
    btn.addEventListener('click', apply);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') apply(); });
    return { node: el('span', { style: { display: 'inline-flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' } }, el('label', {}, 'Dãy số:', inp), btn, extra), input: inp };
}

function makeBubbleSteps(input) {
    const a = [...input];
    const n = a.length;
    const sorted = new Set();
    let comps = 0;
    let swaps = 0;
    const steps = [{ arr: [...a], hi: {}, tags: {}, comps, swaps, line: 0, msg: `Bắt đầu Bubble Sort trên ${n} phần tử.` }];
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
            comps++;
            const hi = { [j]: 'compare', [j + 1]: 'compare' };
            sorted.forEach(idx => { hi[idx] = 'sorted'; });
            steps.push({ arr: [...a], hi, tags: { [j]: 'j', [j + 1]: 'j+1' }, comps, swaps, line: 2, msg: `So sánh a[${j}]=${a[j]} với a[${j + 1}]=${a[j + 1]}.` });
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swaps++;
                swapped = true;
                const sHi = { [j]: 'swap', [j + 1]: 'swap' };
                sorted.forEach(idx => { sHi[idx] = 'sorted'; });
                steps.push({ arr: [...a], hi: sHi, tags: { [j]: 'đổi', [j + 1]: 'đổi' }, comps, swaps, line: 3, msg: `Vì ${a[j + 1]} > ${a[j]}, hoán đổi để đẩy phần tử lớn hơn về cuối.` });
            }
        }
        sorted.add(n - 1 - i);
        if (!swapped) {
            for (let k = 0; k < n; k++) sorted.add(k);
            const doneHi = Object.fromEntries(a.map((_, idx) => [idx, 'sorted']));
            steps.push({ arr: [...a], hi: doneHi, tags: {}, comps, swaps, line: 4, msg: 'Không có lần đổi chỗ nào ở lượt này → mảng đã có thứ tự, dừng sớm!' });
            return steps;
        }
    }
    const doneHi = Object.fromEntries(a.map((_, idx) => [idx, 'sorted']));
    steps.push({ arr: [...a], hi: doneHi, tags: {}, comps, swaps, line: 5, msg: `Hoàn tất! Đã sắp xếp tăng dần sau ${comps} so sánh và ${swaps} lần hoán đổi.` });
    return steps;
}

function makeSelectionSteps(input) {
    const a = [...input];
    const n = a.length;
    let comps = 0, swaps = 0;
    const hiDone = k => Object.fromEntries(Array.from({ length: k }, (_, x) => [x, 'sorted']));
    const steps = [{ arr: [...a], hi: {}, tags: {}, comps, swaps, line: 0, msg: 'Bắt đầu Selection Sort: mỗi lượt chọn phần tử nhỏ nhất ở đoạn chưa sắp xếp.' }];
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        steps.push({ arr: [...a], hi: { ...hiDone(i), [i]: 'active' }, tags: { [i]: 'min' }, comps, swaps, line: 1, msg: `Lượt i=${i}: tạm đặt minIdx = ${i} (giá trị ${a[i]}).` });
        for (let j = i + 1; j < n; j++) {
            comps++;
            steps.push({ arr: [...a], hi: { ...hiDone(i), [minIdx]: 'active', [j]: 'compare' }, tags: { [minIdx]: 'min', [j]: 'j' }, comps, swaps, line: 3, msg: `So sánh a[${j}]=${a[j]} với min hiện tại a[${minIdx}]=${a[minIdx]}.` });
            if (a[j] < a[minIdx]) {
                minIdx = j;
                steps.push({ arr: [...a], hi: { ...hiDone(i), [minIdx]: 'active' }, tags: { [minIdx]: 'min mới' }, comps, swaps, line: 4, msg: `Tìm thấy giá trị nhỏ hơn: cập nhật minIdx = ${minIdx} (${a[minIdx]}).` });
            }
        }
        if (minIdx !== i) {
            [a[i], a[minIdx]] = [a[minIdx], a[i]];
            swaps++;
            steps.push({ arr: [...a], hi: { ...hiDone(i), [i]: 'swap', [minIdx]: 'swap' }, tags: { [i]: 'đưa về đầu' }, comps, swaps, line: 5, msg: `Hoán đổi a[${i}] với a[${minIdx}] (chỉ tối đa 1 lần swap mỗi lượt i).` });
        }
    }
    steps.push({ arr: [...a], hi: Object.fromEntries(a.map((_, x) => [x, 'sorted'])), tags: {}, comps, swaps, line: 6, msg: `Hoàn tất Selection Sort: ${comps} so sánh, đúng ${swaps} hoán đổi.` });
    return steps;
}

function makeInsertionSteps(input) {
    const a = [...input];
    const n = a.length;
    let comps = 0, shifts = 0;
    const steps = [{ arr: [...a], hi: { 0: 'sorted' }, tags: { 0: 'đã xếp' }, comps, shifts, line: 0, msg: 'Coi đoạn a[0..0] gồm 1 phần tử đầu tiên là đã có thứ tự.' }];
    for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        const prefixHi = Object.fromEntries(Array.from({ length: i }, (_, k) => [k, 'sorted']));
        steps.push({ arr: [...a], hi: { ...prefixHi, [i]: 'pivot' }, tags: { [i]: `key=${key}` }, comps, shifts, line: 1, msg: `Lấy key = a[${i}] = ${key} để chèn vào đoạn đã sắp a[0..${i - 1}].` });
        while (j >= 0) {
            comps++;
            if (a[j] > key) {
                a[j + 1] = a[j];
                shifts++;
                const h = Object.fromEntries(Array.from({ length: i + 1 }, (_, k) => [k, 'sorted']));
                h[j] = 'compare';
                h[j + 1] = 'swap';
                steps.push({ arr: [...a], hi: h, tags: { [j]: 'trống', [j + 1]: 'dịch' }, comps, shifts, line: 3, msg: `a[${j}]=${a[j]} > key=${key}, dịch a[${j}] sang phải.` });
                j--;
            } else {
                steps.push({ arr: [...a], hi: { ...prefixHi, [j]: 'compare' }, tags: { [j]: 'dừng' }, comps, shifts, line: 2, msg: `a[${j}]=${a[j]} <= key=${key}, dừng dịch chuyển.` });
                break;
            }
        }
        a[j + 1] = key;
        steps.push({ arr: [...a], hi: Object.fromEntries(Array.from({ length: i + 1 }, (_, k) => [k, k === j + 1 ? 'active' : 'sorted'])), tags: { [j + 1]: `chèn ${key}` }, comps, shifts, line: 5, msg: `Đặt key=${key} vào vị trí [${j + 1}]. Đoạn a[0..${i}] đã có thứ tự.` });
    }
    steps.push({ arr: [...a], hi: Object.fromEntries(a.map((_, k) => [k, 'sorted'])), tags: {}, comps, shifts, line: 6, msg: `Hoàn tất Insertion Sort (${comps} so sánh, ${shifts} lần dịch phần tử).` });
    return steps;
}

function makeShuffleSteps(input) {
    const a = [...input];
    const n = a.length;
    const steps = [{ arr: [...a], hi: {}, tags: {}, line: 0, msg: 'Khởi tạo mảng ban đầu. Fisher-Yates duyệt i từ cuối (hoặc đầu) và chọn ngẫu nhiên r đều trong đoạn còn lại.' }];
    for (let i = n - 1; i > 0; i--) {
        const r = Math.floor((Math.sin(i * 19 + a[0] * 7) * 0.5 + 0.5) * (i + 1));
        steps.push({ arr: [...a], hi: { [i]: 'active', [r]: 'compare' }, tags: { [i]: 'i', [r]: `r=${r}` }, line: 2, msg: `Với i=${i}, chọn ngẫu nhiên r = ${r} trong [0..${i}].` });
        [a[i], a[r]] = [a[r], a[i]];
        const hi = { [i]: 'sorted', [r]: 'swap' };
        for (let k = i + 1; k < n; k++) hi[k] = 'sorted';
        steps.push({ arr: [...a], hi, tags: { [i]: 'đã trộn', [r]: 'đổi' }, line: 3, msg: `Hoán đổi a[${i}] và a[${r}]. Phần tử ở cuối [${i}..${n - 1}] đã cố định hoán vị.` });
    }
    steps.push({ arr: [...a], hi: Object.fromEntries(a.map((_, k) => [k, 'sorted'])), tags: {}, line: 4, msg: 'Hoàn tất trộn ngẫu nhiên đồng phân phối O(n) với mọi hoán vị xác suất 1/n!.' });
    return steps;
}

function makeQuickSortSteps(input) {
    const a = [...input];
    const n = a.length;
    const fixed = new Set();
    let comps = 0, swaps = 0;
    const steps = [{ arr: [...a], hi: {}, tags: {}, comps, swaps, line: 0, msg: 'Bắt đầu Quick Sort (chia Lomuto chọn pivot ở cuối đoạn [low..high]).' }];

    function hiBase(low, high) {
        const h = {};
        for (let k = 0; k < n; k++) h[k] = fixed.has(k) ? 'sorted' : (k < low || k > high ? 'dim' : '');
        return h;
    }

    function qs(low, high) {
        if (low > high) return;
        if (low === high) {
            fixed.add(low);
            steps.push({ arr: [...a], hi: hiBase(low, high), tags: { [low]: 'đơn' }, comps, swaps, line: 1, msg: `Đoạn [${low}..${high}] chỉ còn 1 phần tử a[${low}]=${a[low]}, coi như đã cố định.` });
            return;
        }
        const pivot = a[high];
        let i = low - 1;
        const pHi = hiBase(low, high);
        pHi[high] = 'pivot';
        steps.push({ arr: [...a], hi: pHi, tags: { [high]: `pivot=${pivot}` }, comps, swaps, line: 2, msg: `Phân hoạch [${low}..${high}] với pivot = a[${high}] = ${pivot}.` });

        for (let j = low; j < high; j++) {
            comps++;
            const cHi = hiBase(low, high);
            cHi[high] = 'pivot';
            cHi[j] = 'compare';
            if (i >= low) cHi[i] = 'active';
            steps.push({ arr: [...a], hi: cHi, tags: { ...(i >= low ? { [i]: 'i' } : {}), [j]: 'j', [high]: 'pivot' }, comps, swaps, line: 4, msg: `So sánh a[${j}]=${a[j]} với pivot=${pivot}.` });
            if (a[j] <= pivot) {
                i++;
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                    swaps++;
                    const sHi = hiBase(low, high);
                    sHi[high] = 'pivot'; sHi[i] = 'swap'; sHi[j] = 'swap';
                    steps.push({ arr: [...a], hi: sHi, tags: { [i]: '≤ pivot', [j]: 'đổi', [high]: 'pivot' }, comps, swaps, line: 5, msg: `a[${j}] <= ${pivot}: tăng i=${i} và hoán đổi a[${i}] với a[${j}].` });
                }
            }
        }
        [a[i + 1], a[high]] = [a[high], a[i + 1]];
        swaps++;
        const pIdx = i + 1;
        fixed.add(pIdx);
        steps.push({ arr: [...a], hi: hiBase(low, high), tags: { [pIdx]: 'pivot chốt' }, comps, swaps, line: 6, msg: `Đưa pivot=${pivot} về đúng vị trí chốt [${pIdx}]. Bên trái ≤ ${pivot}, bên phải > ${pivot}.` });
        qs(low, pIdx - 1);
        qs(pIdx + 1, high);
    }

    qs(0, n - 1);
    steps.push({ arr: [...a], hi: Object.fromEntries(a.map((_, k) => [k, 'sorted'])), tags: {}, comps, swaps, line: 7, msg: `Hoàn tất Quick Sort (${comps} so sánh, ${swaps} hoán đổi).` });
    return steps;
}

function makeMergeSortSteps(input) {
    const a = [...input];
    const n = a.length;
    let comps = 0, merges = 0;
    const steps = [{ arr: [...a], aux: null, hi: {}, tags: {}, comps, merges, line: 0, msg: 'Merge Sort chia đôi liên tiếp đến đoạn 1 phần tử rồi trộn 2 nửa đã sắp xếp.' }];

    function ms(l, r) {
        if (l >= r) return;
        const mid = (l + r) >> 1;
        const splitHi = {};
        for (let k = 0; k < n; k++) splitHi[k] = k < l || k > r ? 'dim' : k <= mid ? 'active' : 'compare';
        steps.push({ arr: [...a], aux: null, hi: splitHi, tags: { [l]: 'L', [mid]: 'mid', [r]: 'R' }, comps, merges, line: 2, msg: `Chia đoạn [${l}..${r}] thành [${l}..${mid}] và [${mid + 1}..${r}].` });
        ms(l, mid);
        ms(mid + 1, r);

        const left = a.slice(l, mid + 1);
        const right = a.slice(mid + 1, r + 1);
        let i = 0, j = 0, k = l;
        const merged = [];
        while (i < left.length && j < right.length) {
            comps++;
            if (left[i] <= right[j]) merged.push(left[i++]);
            else merged.push(right[j++]);
        }
        while (i < left.length) merged.push(left[i++]);
        while (j < right.length) merged.push(right[j++]);

        for (let m = 0; m < merged.length; m++) a[k + m] = merged[m];
        merges++;
        const mHi = {};
        for (let idx = 0; idx < n; idx++) mHi[idx] = idx >= l && idx <= r ? 'sorted' : 'dim';
        steps.push({
            arr: [...a],
            aux: { left, right, merged, l, r },
            hi: mHi,
            tags: { [l]: 'trộn xong', [r]: '' },
            comps,
            merges,
            line: 5,
            msg: `Trộn [${left.join(', ')}] và [${right.join(', ')}] thành [${merged.join(', ')}] vào vị trí [${l}..${r}].`
        });
    }

    ms(0, n - 1);
    steps.push({ arr: [...a], aux: null, hi: Object.fromEntries(a.map((_, k) => [k, 'sorted'])), tags: {}, comps, merges, line: 6, msg: `Hoàn tất Merge Sort (${comps} so sánh, ${merges} lần trộn hai nửa).` });
    return steps;
}

function makeHeapSortSteps(input) {
    const a = [...input];
    const n = a.length;
    let comps = 0, swaps = 0;
    const steps = [{ arr: [...a], heapEnd: n, hi: {}, tags: {}, comps, swaps, line: 0, msg: 'Giai đoạn 1: Xây dựng Max-Heap từ dưới lên (i từ n/2 - 1 về 0).' }];

    function sink(size, i, sortedFrom, phaseMsg) {
        let idx = i;
        while (true) {
            let largest = idx;
            const l = 2 * idx + 1, r = 2 * idx + 2;
            if (l < size) { comps++; if (a[l] > a[largest]) largest = l; }
            if (r < size) { comps++; if (a[r] > a[largest]) largest = r; }
            if (largest === idx) break;
            [a[idx], a[largest]] = [a[largest], a[idx]];
            swaps++;
            const hi = {};
            for (let k = sortedFrom; k < n; k++) hi[k] = 'sorted';
            hi[idx] = 'swap';
            hi[largest] = 'swap';
            steps.push({ arr: [...a], heapEnd: size, hi, tags: { [idx]: 'cha', [largest]: 'con' }, comps, swaps, line: phaseMsg === 'build' ? 2 : 5, msg: `sink(${idx}): đẩy ${a[idx]} lên thay vị trí ${idx} để giữ tính chất Max-Heap.` });
            idx = largest;
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) sink(n, i, n, 'build');
    steps.push({ arr: [...a], heapEnd: n, hi: { 0: 'pivot' }, tags: { 0: 'max' }, comps, swaps, line: 3, msg: `Đã dựng xong Max-Heap! Phần tử lớn nhất a[0] = ${a[0]} đang ở gốc.` });

    for (let end = n - 1; end > 0; end--) {
        [a[0], a[end]] = [a[end], a[0]];
        swaps++;
        const hi = { 0: 'swap', [end]: 'sorted' };
        for (let k = end + 1; k < n; k++) hi[k] = 'sorted';
        steps.push({ arr: [...a], heapEnd: end, hi, tags: { [end]: 'chốt max' }, comps, swaps, line: 4, msg: `Đưa max=${a[end]} từ gốc về cuối [${end}], thu hẹp kích thước heap còn ${end}.` });
        sink(end, 0, end, 'extract');
    }
    steps.push({ arr: [...a], heapEnd: 0, hi: Object.fromEntries(a.map((_, k) => [k, 'sorted'])), tags: {}, comps, swaps, line: 6, msg: `Hoàn tất Heap Sort O(n log n) tại chỗ (${comps} so sánh, ${swaps} hoán đổi).` });
    return steps;
}

function makeSearchSteps(input, target, binary = false) {
    const a = binary ? [...input].sort((x, y) => x - y) : [...input];
    const n = a.length;
    if (!binary) {
        const steps = [{ arr: a, hi: {}, tags: {}, target, line: 0, msg: `Tìm giá trị ${target} bằng duyệt tuần tự từ chỉ số 0.` }];
        for (let i = 0; i < n; i++) {
            if (a[i] === target) {
                steps.push({ arr: a, hi: { [i]: 'sorted' }, tags: { [i]: 'tìm thấy!' }, target, line: 2, msg: `a[${i}] = ${a[i]} == ${target} → Tìm thấy tại chỉ số ${i}!` });
                return steps;
            }
            steps.push({ arr: a, hi: { [i]: 'compare' }, tags: { [i]: 'i' }, target, line: 1, msg: `Kiểm tra a[${i}] = ${a[i]} != ${target}, đi tiếp.` });
        }
        steps.push({ arr: a, hi: Object.fromEntries(a.map((_, i) => [i, 'dim'])), tags: {}, target, line: 3, msg: `Đã duyệt hết mảng, không có ${target} → trả về -1.` });
        return steps;
    }

    let low = 0, high = n - 1;
    const steps = [{ arr: a, hi: {}, tags: { [low]: 'low', [high]: 'high' }, target, line: 0, msg: `Mảng đã sắp xếp tăng dần. Tìm ${target} trong đoạn [0..${n - 1}].` }];
    while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        const hi = {};
        for (let k = 0; k < n; k++) hi[k] = k < low || k > high ? 'dim' : k === mid ? 'pivot' : 'active';
        steps.push({ arr: a, hi, tags: { [low]: low === mid ? 'low/mid' : 'low', [mid]: 'mid', [high]: high === mid ? 'mid/high' : 'high' }, target, line: 2, msg: `Tính mid = ${mid}, a[mid] = ${a[mid]}. So sánh với ${target}.` });
        if (a[mid] === target) {
            hi[mid] = 'sorted';
            steps.push({ arr: a, hi, tags: { [mid]: 'khớp!' }, target, line: 3, msg: `a[${mid}] == ${target} → Tìm thấy ở chỉ số ${mid}!` });
            return steps;
        }
        if (a[mid] < target) {
            low = mid + 1;
            steps.push({ arr: a, hi, tags: { [mid]: `< ${target}` }, target, line: 4, msg: `${a[mid]} < ${target} → Bỏ nửa trái, dịch low = ${low}.` });
        } else {
            high = mid - 1;
            steps.push({ arr: a, hi, tags: { [mid]: `> ${target}` }, target, line: 5, msg: `${a[mid]} > ${target} → Bỏ nửa phải, dịch high = ${high}.` });
        }
    }
    steps.push({ arr: a, hi: Object.fromEntries(a.map((_, i) => [i, 'dim'])), tags: {}, target, line: 6, msg: `low (${low}) > high (${high}) → Không tồn tại ${target}, trả về -1.` });
    return steps;
}

export function mountSorting(host, piece) {
    const id = piece.id;

    if (id === 'bubble-sort' || id === 'generic-bubble-sort') {
        let cur = [6, 2, 9, 1, 5, 4];
        const ctrl = arrayInputControl(cur, next => { cur = next; stepper.update(makeBubbleSteps(cur)); });
        const stepper = createStepper(host, {
            title: id === 'generic-bubble-sort' ? 'Generic Bubble Sort (Comparable<T>)' : 'Bubble Sort (Sắp xếp nổi bọt)',
            subtitle: id === 'generic-bubble-sort' ? 'Dùng compareTo() thay cho dấu > nên áp dụng được với mọi kiểu Comparable.' : 'Đẩy phần tử lớn nhất về cuối sau mỗi lượt quét.',
            controlsNode: ctrl.node,
            presets: [
                { label: 'Ngẫu nhiên [6,2,9,1,5,4]', steps: () => makeBubbleSteps([6, 2, 9, 1, 5, 4]) },
                { label: 'Gần như đã sắp (dừng sớm)', steps: () => makeBubbleSteps([1, 2, 3, 5, 4, 6]) },
                { label: 'Đảo ngược (xấu nhất)', steps: () => makeBubbleSteps([9, 7, 5, 3, 1]) }
            ],
            steps: makeBubbleSteps(cur),
            stats: f => [['So sánh', f.comps], ['Hoán đổi', f.swaps]],
            codeLines: [
                'for (int i = 0; i < n - 1; i++) {',
                '    boolean swapped = false;',
                '    for (int j = 0; j < n - 1 - i; j++)',
                '        if (a[j] > a[j + 1]) { swap(j, j + 1); swapped = true; }',
                '    if (!swapped) break; // Dừng sớm khi mảng đã chuẩn',
                '}'
            ],
            render: (stage, f) => renderBars(stage, f.arr, f.hi, f.tags)
        });
        return;
    }

    if (id === 'selection-sort') {
        let cur = [7, 3, 9, 2, 6, 4];
        const ctrl = arrayInputControl(cur, next => { cur = next; stepper.update(makeSelectionSteps(cur)); });
        const stepper = createStepper(host, {
            title: 'Selection Sort (Sắp xếp chọn)',
            subtitle: 'Luôn tìm chỉ số min ở phần đuôi rồi đổi chỗ đúng 1 lần về đầu đoạn.',
            controlsNode: ctrl.node,
            presets: [
                { label: 'Mẫu [7,3,9,2,6,4]', steps: () => makeSelectionSteps([7, 3, 9, 2, 6, 4]) },
                { label: 'Đảo ngược [8,6,4,2,1]', steps: () => makeSelectionSteps([8, 6, 4, 2, 1]) }
            ],
            steps: makeSelectionSteps(cur),
            stats: f => [['So sánh', f.comps], ['Hoán đổi', f.swaps]],
            codeLines: [
                'for (int i = 0; i < n - 1; i++) {',
                '    int minIdx = i;',
                '    for (int j = i + 1; j < n; j++)',
                '        if (a[j] < a[minIdx]) minIdx = j;',
                '    swap(a, i, minIdx);',
                '}'
            ],
            render: (stage, f) => renderBars(stage, f.arr, f.hi, f.tags)
        });
        return;
    }

    if (id === 'insertion-sort') {
        let cur = [5, 2, 8, 1, 6, 3];
        const ctrl = arrayInputControl(cur, next => { cur = next; stepper.update(makeInsertionSteps(cur)); });
        const stepper = createStepper(host, {
            title: 'Insertion Sort (Sắp xếp chèn)',
            subtitle: 'Giống xếp bài trên tay: nhấc key ra, dịch phần tử lớn hơn sang phải rồi chèn vào.',
            controlsNode: ctrl.node,
            presets: [
                { label: 'Mẫu [5,2,8,1,6,3]', steps: () => makeInsertionSteps([5, 2, 8, 1, 6, 3]) },
                { label: 'Gần đã sắp O(n)', steps: () => makeInsertionSteps([1, 2, 4, 3, 5, 6]) }
            ],
            steps: makeInsertionSteps(cur),
            stats: f => [['So sánh', f.comps], ['Dịch chuyển', f.shifts]],
            codeLines: [
                'for (int i = 1; i < n; i++) {',
                '    int key = a[i], j = i - 1;',
                '    while (j >= 0 && a[j] > key) {',
                '        a[j + 1] = a[j]; j--;',
                '    }',
                '    a[j + 1] = key;',
                '}'
            ],
            render: (stage, f) => renderBars(stage, f.arr, f.hi, f.tags)
        });
        return;
    }

    if (id === 'shuffle-sort') {
        let cur = [10, 20, 30, 40, 50, 60];
        const ctrl = arrayInputControl(cur, next => { cur = next; stepper.update(makeShuffleSteps(cur)); });
        const stepper = createStepper(host, {
            title: 'Knuth / Fisher-Yates Shuffle',
            subtitle: 'Trộn ngẫu nhiên mảng trong đúng một vòng lặp O(n) với phân phối đều 1/n!.',
            controlsNode: ctrl.node,
            steps: makeShuffleSteps(cur),
            codeLines: [
                'for (int i = n - 1; i > 0; i--) {',
                '    int r = rand.nextInt(i + 1); // 0 <= r <= i',
                '    swap(a, i, r);',
                '}'
            ],
            render: (stage, f) => renderBars(stage, f.arr, f.hi, f.tags)
        });
        return;
    }

    if (id === 'quick-sort') {
        let cur = [7, 2, 9, 1, 6, 8, 4];
        const ctrl = arrayInputControl(cur, next => { cur = next; stepper.update(makeQuickSortSteps(cur)); });
        const stepper = createStepper(host, {
            title: 'Quick Sort (Phân hoạch Lomuto)',
            subtitle: 'Chọn chốt pivot, dồn phần tử ≤ pivot sang trái rồi đệ quy 2 nửa.',
            controlsNode: ctrl.node,
            presets: [
                { label: 'Cân bằng [7,2,9,1,6,8,4]', steps: () => makeQuickSortSteps([7, 2, 9, 1, 6, 8, 4]) },
                { label: 'Đã sắp (lệch O(n²))', steps: () => makeQuickSortSteps([1, 2, 3, 4, 5, 6]) }
            ],
            steps: makeQuickSortSteps(cur),
            stats: f => [['So sánh', f.comps], ['Hoán đổi', f.swaps]],
            codeLines: [
                'if (low >= high) return;',
                'int pivot = a[high], i = low - 1;',
                'for (int j = low; j < high; j++)',
                '    if (a[j] <= pivot) swap(a, ++i, j);',
                'swap(a, i + 1, high);',
                'quickSort(low, i); quickSort(i + 2, high);'
            ],
            render: (stage, f) => renderBars(stage, f.arr, f.hi, f.tags)
        });
        return;
    }

    if (id === 'merge-sort') {
        let cur = [8, 3, 6, 1, 7, 2, 5];
        const ctrl = arrayInputControl(cur, next => { cur = next; stepper.update(makeMergeSortSteps(cur)); });
        const stepper = createStepper(host, {
            title: 'Merge Sort (Chia để trị + Trộn ổn định)',
            subtitle: 'Chia đôi mảng rồi trộn 2 nửa đã có thứ tự vào vùng đệm O(n).',
            controlsNode: ctrl.node,
            steps: makeMergeSortSteps(cur),
            stats: f => [['So sánh', f.comps], ['Lần trộn', f.merges]],
            codeLines: [
                'if (l >= r) return;',
                'int mid = (l + r) / 2;',
                'mergeSort(l, mid); mergeSort(mid + 1, r);',
                '// Trộn 2 con trỏ i (trái) và j (phải)',
                'merge(a, l, mid, r);'
            ],
            render: (stage, f) => {
                renderBars(stage, f.arr, f.hi, f.tags);
                if (f.aux) {
                    stage.append(el('p', {
                        style: { marginTop: '12px', textAlign: 'center', fontSize: '12.5px', color: '#1c2863', fontFamily: 'var(--font-mono)' },
                        text: `Trộn [${f.aux.left.join(', ')}] + [${f.aux.right.join(', ')}] → [${f.aux.merged.join(', ')}]`
                    }));
                }
            }
        });
        return;
    }

    if (id === 'heap-sort') {
        let cur = [4, 10, 3, 5, 1, 8, 7];
        const ctrl = arrayInputControl(cur, next => { cur = next; stepper.update(makeHeapSortSteps(cur)); });
        const stepper = createStepper(host, {
            title: 'Heap Sort (Sắp xếp vun đống tại chỗ)',
            subtitle: 'Dựng Max-Heap tại chỗ rồi đổi gốc max về cuối mảng và chìm xuống (sink).',
            controlsNode: ctrl.node,
            steps: makeHeapSortSteps(cur),
            stats: f => [['Kích thước Heap', f.heapEnd], ['So sánh', f.comps], ['Hoán đổi', f.swaps]],
            codeLines: [
                'for (int i = n / 2 - 1; i >= 0; i--) sink(a, n, i);',
                'for (int end = n - 1; end > 0; end--) {',
                '    swap(a, 0, end);',
                '    sink(a, end, 0);',
                '}'
            ],
            render: (stage, f) => renderBars(stage, f.arr, f.hi, f.tags)
        });
        return;
    }

    if (id === 'sequential-search' || id === 'binary-search') {
        const isBinary = id === 'binary-search';
        let cur = isBinary ? [2, 5, 8, 12, 16, 23, 38, 56] : [14, 7, 23, 5, 19, 8];
        let target = isBinary ? 23 : 19;
        const tInp = el('input', { type: 'number', value: String(target), style: { width: '72px' }, 'aria-label': 'Giá trị cần tìm' });
        const ctrl = arrayInputControl(cur, next => {
            cur = next;
            target = Number(tInp.value) || 0;
            stepper.update(makeSearchSteps(cur, target, isBinary));
        }, el('label', {}, 'Cần tìm:', tInp));
        tInp.addEventListener('change', () => {
            target = Number(tInp.value) || 0;
            stepper.update(makeSearchSteps(cur, target, isBinary));
        });
        const stepper = createStepper(host, {
            title: isBinary ? 'Binary Search (Tìm kiếm nhị phân)' : 'Sequential Search (Tìm kiếm tuần tự)',
            subtitle: isBinary ? 'Mỗi bước chặt đôi đoạn tìm kiếm [low..high] khi mảng đã sắp xếp.' : 'Kiểm tra từng phần tử từ đầu đến cuối khi mảng chưa sắp xếp.',
            controlsNode: ctrl.node,
            steps: makeSearchSteps(cur, target, isBinary),
            codeLines: isBinary
                ? ['int low = 0, high = n - 1;', 'while (low <= high) {', '    int mid = low + (high - low) / 2;', '    if (a[mid] == x) return mid;', '    if (a[mid] < x) low = mid + 1;', '    else high = mid - 1;', '} return -1;']
                : ['for (int i = 0; i < n; i++)', '    if (a[i] == x) return i;', 'return -1;'],
            render: (stage, f) => renderCells(stage, f.arr, f.hi, `Đang tìm x = ${f.target}`)
        });
        return;
    }

    if (id === 'sorting-problem') {
        const raw = [5, 2, 4, 1, 3];
        let inv = [];
        for (let i = 0; i < raw.length; i++) for (let j = i + 1; j < raw.length; j++) if (raw[i] > raw[j]) inv.push([i, j, raw[i], raw[j]]);
        const steps = [
            { arr: raw, hi: {}, msg: `Mảng đầu vào [${raw.join(', ')}] có ${inv.length} cặp nghịch thế (i < j nhưng a[i] > a[j]). Mục tiêu: giảm số nghịch thế về 0.` },
            ...inv.slice(0, 4).map(([i, j, x, y]) => ({ arr: raw, hi: { [i]: 'swap', [j]: 'swap' }, msg: `Cặp nghịch thế (${x}, ${y}) ở chỉ số [${i}] và [${j}]: đứng sai thứ tự tăng dần.` })),
            { arr: [...raw].sort((x, y) => x - y), hi: { 0: 'sorted', 1: 'sorted', 2: 'sorted', 3: 'sorted', 4: 'sorted' }, msg: 'Mảng đầu ra đã sắp xếp: số cặp nghịch thế = 0, bảo toàn tập phần tử ban đầu.' }
        ];
        createStepper(host, {
            title: 'Mô hình bài toán Sắp xếp & Cặp nghịch thế',
            subtitle: 'Sắp xếp thực chất là khử toàn bộ các cặp nghịch thế while giữ nguyên đa tập phần tử.',
            steps,
            render: (stage, f) => renderBars(stage, f.arr, f.hi, {})
        });
        return;
    }

    if (id === 'sort-properties') {
        const init = [
            { k: 3, tag: 'A', label: '3(A)' },
            { k: 1, tag: 'A', label: '1(A)' },
            { k: 3, tag: 'B', label: '3(B)' },
            { k: 2, tag: 'A', label: '2(A)' }
        ];
        const steps = [
            { left: init, right: init, msg: 'Chú ý hai phần tử có cùng khóa 3: 3(A) đứng trước 3(B). Thuật toán ổn định phải giữ nguyên 3(A) trước 3(B).' },
            {
                left: [init[1], init[3], init[0], init[2]],
                right: [init[1], init[3], init[2], init[0]],
                msg: 'Insertion/Merge Sort (Ổn định): kết quả giữ 3(A) trước 3(B). Selection/Quick Sort (Không ổn định) có thể tráo 3(B) lên trước 3(A)!'
            }
        ];
        createStepper(host, {
            title: 'So sánh Tính ổn định (Stability) khi có khóa bằng nhau',
            subtitle: 'Quan trọng khi sắp xếp bản ghi theo nhiều tiêu chí (ví dụ: sắp tên rồi sắp điểm).',
            steps,
            render: (stage, f) => {
                renderCells(stage, f.left.map(x => ({ val: x.label, sub: 'Ổn định' })), { 2: 'found', 3: 'found' }, 'Ổn định: Insertion / Merge Sort');
                stage.append(el('div', { style: { height: '12px' } }));
                renderCells(stage, f.right.map(x => ({ val: x.label, sub: 'Không ổn định' })), { 2: 'swap', 3: 'swap' }, 'Không ổn định: Selection / Quick / Heap Sort');
            }
        });
        return;
    }

    if (id === 'hw-sorting-benchmark') {
        const inputs = {
            random: { label: 'Ngẫu nhiên (n = 1000)', rows: [['Bubble', '~500,000', '~250,000', 'O(1)'], ['Selection', '~500,000', '999', 'O(1)'], ['Insertion', '~250,000', '~250,000', 'O(1)'], ['Merge', '~8,700', '~10,000 (chép)', 'O(n)'], ['Quick', '~11,000', '~3,500', 'O(log n)'], ['Heap', '~18,000', '~9,000', 'O(1)']] },
            nearly: { label: 'Gần như đã sắp (n = 1000)', rows: [['Bubble (early)', '~1,998', '15', 'O(1)'], ['Selection', '~500,000', '~15', 'O(1)'], ['Insertion', '~1,015', '~15', 'O(1) ★'], ['Merge', '~8,700', '~10,000', 'O(n)'], ['Quick', '~11,000', '~3,500', 'O(log n)'], ['Heap', '~17,500', '~8,500', 'O(1)']] },
            reversed: { label: 'Ngược thứ tự (n = 1000)', rows: [['Bubble', '499,500', '499,500', 'O(1)'], ['Selection', '499,500', '500', 'O(1)'], ['Insertion', '499,500', '499,500', 'O(1)'], ['Merge', '~5,000', '~10,000', 'O(n) ★'], ['Quick (pivot cuối)', '499,500!', '~250,000', 'O(n)!'], ['Heap', '~16,500', '~8,800', 'O(1) ★']] }
        };
        const makePreset = key => [{
            mode: inputs[key].label,
            rows: inputs[key].rows,
            msg: `${inputs[key].label}: Chú ý Insertion cực nhanh trên dữ liệu gần sắp; Merge/Heap ổn định ~n log n ngay cả khi đảo ngược.`
        }];
        createStepper(host, {
            title: 'So sánh thực nghiệm các thuật toán sắp xếp (n = 1000)',
            subtitle: 'Chọn loại dữ liệu đầu vào để quan sát số phép so sánh, hoán đổi và bộ nhớ phụ.',
            presets: Object.keys(inputs).map(k => ({ label: inputs[k].label.split(' (')[0], steps: makePreset(k) })),
            steps: makePreset('random'),
            render: (stage, f) => {
                const wrap = el('div', { class: 'table-wrap' });
                const table = el('table', {},
                    el('thead', {}, el('tr', {}, el('th', {}, 'Thuật toán'), el('th', {}, 'So sánh'), el('th', {}, 'Đổi chỗ / Chép'), el('th', {}, 'Bộ nhớ phụ'))),
                    el('tbody', {}, f.rows.map(r => el('tr', {}, r.map(c => el('td', { text: c })))))
                );
                wrap.append(table);
                stage.append(wrap);
            }
        });
        return;
    }

    // ex-count-pairs
    const arr = [-7, -3, -1, 1, 2, 3, 5, 7];
    const pairsSteps = [
        { arr, i: -1, j: -1, found: [], msg: 'Bài toán 2-Sum = 0: sắp xếp tăng dần trước hết mất O(n log n), rồi dùng hai con trỏ i (trái) & j (phải).' },
        { arr, i: 0, j: 7, found: [[-7, 7]], msg: 'a[0] + a[7] = -7 + 7 = 0 → Đếm cặp (-7, 7)! Tăng i=1, giảm j=6.' },
        { arr, i: 1, j: 6, found: [[-7, 7]], msg: 'a[1] + a[6] = -3 + 5 = 2 > 0 → Tổng quá lớn, giảm j=5.' },
        { arr, i: 1, j: 5, found: [[-7, 7], [-3, 3]], msg: 'a[1] + a[5] = -3 + 3 = 0 → Đếm cặp (-3, 3)! Tăng i=2, giảm j=4.' },
        { arr, i: 2, j: 4, found: [[-7, 7], [-3, 3]], msg: 'a[2] + a[4] = -1 + 2 = 1 > 0 → Tổng > 0, giảm j=3.' },
        { arr, i: 2, j: 3, found: [[-7, 7], [-3, 3], [-1, 1]], msg: 'a[2] + a[3] = -1 + 1 = 0 → Đếm cặp (-1, 1)! Tổng cộng 3 cặp trong O(n log n) thay vì O(n²).' }
    ];
    createStepper(host, {
        title: 'Đếm cặp có tổng bằng 0 (Sắp xếp + Hai con trỏ)',
        subtitle: 'Thay vì hai vòng lặp O(n²), sắp xếp rồi co 2 đầu chỉ mất O(n) bước duyệt.',
        steps: pairsSteps,
        stats: f => [['Số cặp = 0 đã đếm', f.found.length]],
        codeLines: [
            'Arrays.sort(a);',
            'int i = 0, j = n - 1, count = 0;',
            'while (i < j) {',
            '    int s = a[i] + a[j];',
            '    if (s == 0) { count++; i++; j--; }',
            '    else if (s < 0) i++; else j--;',
            '}'
        ],
        render: (stage, f) => {
            const hi = {};
            if (f.i >= 0) hi[f.i] = 'active';
            if (f.j >= 0) hi[f.j] = 'compare';
            renderCells(stage, f.arr, hi, f.found.length ? `Đã tìm thấy: ${f.found.map(p => `(${p[0]}, ${p[1]})`).join(', ')}` : '');
        }
    });
}
