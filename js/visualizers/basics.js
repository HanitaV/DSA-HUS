import { createStepper, el, renderCells, svgEl } from './shared.js';

function pipelineSteps(title, nodes, captions) {
    return {
        title,
        steps: captions.map((msg, active) => ({ active, msg })),
        render: (stage, f) => renderCells(
            stage,
            nodes.map((val, i) => ({ val, sub: i <= f.active ? '✓' : '·' })),
            { [f.active]: 'active', ...Object.fromEntries(nodes.slice(0, f.active).map((_, i) => [i, 'done'])) }
        )
    };
}

function array1dSpec() {
    const arr = [12, 7, 19, 4, 15, 9];
    const steps = [{ arr, idx: -1, best: 0, msg: 'Khởi tạo mảng a[0..5], giả sử max = a[0] = 12.' }];
    let best = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[best]) best = i;
        steps.push({ arr, idx: i, best, msg: `i = ${i}: a[${i}] = ${arr[i]}, max hiện tại = a[${best}] = ${arr[best]}.` });
    }
    steps.push({ arr, idx: -1, best, msg: `Kết thúc vòng lặp: giá trị lớn nhất là ${arr[best]} tại chỉ số ${best}.` });
    return {
        title: 'Duyệt mảng 1 chiều tìm giá trị lớn nhất',
        codeLines: [
            'int max = a[0];',
            'for (int i = 1; i < a.length; i++) {',
            '    if (a[i] > max) max = a[i];',
            '}'
        ],
        steps: steps.map((s, k) => ({ ...s, line: k === 0 ? 0 : k === steps.length - 1 ? 3 : 2 })),
        render: (stage, f) => renderCells(
            stage,
            f.arr.map((v, i) => ({ val: v, sub: `a[${i}]` })),
            { [f.best]: 'done', ...(f.idx >= 0 ? { [f.idx]: 'active' } : {}) }
        )
    };
}

function array2dSpec() {
    const mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const steps = [];
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i === j) sum += mat[i][j];
            steps.push({
                r: i, c: j, sum,
                msg: `Ô [${i}][${j}] = ${mat[i][j]}${i === j ? ` (trên đường chéo chính, tổng = ${sum})` : ''}.`
            });
        }
    }
    return {
        title: 'Duyệt mảng 2 chiều (ma trận 3×3)',
        steps,
        render: (stage, f) => {
            const grid = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 54px)', gap: '6px', justifyContent: 'center' } });
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const active = i === f.r && j === f.c;
                    const diag = i === j;
                    grid.append(el('div', {
                        class: `viz-cell ${active ? 'active' : diag ? 'done' : ''}`,
                        style: { minWidth: '54px', padding: '6px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '8px' }
                    }, el('div', { text: String(mat[i][j]), style: { fontWeight: 700 } }), el('div', { text: `[${i}][${j}]`, style: { fontSize: '11px', opacity: 0.7 } })));
                }
            }
            stage.append(grid);
        }
    };
}

function loopSpec() {
    const steps = [];
    let sum = 0;
    for (let i = 1; i <= 5; i++) {
        if (i === 3) {
            steps.push({ i, sum, skipped: true, msg: 'i = 3: gặp continue → bỏ qua cộng, sang vòng tiếp theo.' });
            continue;
        }
        sum += i;
        steps.push({ i, sum, skipped: false, msg: `i = ${i}: sum += ${i} → sum = ${sum}.` });
    }
    return {
        title: 'Vòng lặp for với continue (tính tổng 1..5 bỏ qua 3)',
        codeLines: [
            'int sum = 0;',
            'for (int i = 1; i <= 5; i++) {',
            '    if (i == 3) continue;',
            '    sum += i;',
            '}'
        ],
        steps: steps.map(s => ({ ...s, line: s.skipped ? 2 : 3 })),
        render: (stage, f) => renderCells(
            stage,
            [1, 2, 3, 4, 5].map(v => ({ val: v, sub: v === 3 ? 'skip' : v <= f.i ? `sum=${f.sum}` : 'chờ' })),
            { [f.i - 1]: f.skipped ? 'pivot' : 'active' }
        )
    };
}

function vigenereSpec() {
    const plain = ['H', 'U', 'S'];
    const key = ['K', 'E', 'Y'];
    const shift = [10, 4, 24];
    const cipher = ['R', 'Y', 'Q'];
    const steps = plain.map((ch, i) => ({
        i,
        msg: `Ký tự '${ch}' + khóa '${key[i]}' (dịch ${shift[i]}) → '${cipher[i]}'.`
    }));
    return {
        title: 'Mã hóa Vigenère từng ký tự',
        steps,
        render: (stage, f) => renderCells(
            stage,
            plain.map((ch, idx) => ({ val: idx <= f.i ? cipher[idx] : ch, sub: idx <= f.i ? `${ch}+${key[idx]}` : 'gốc' })),
            { [f.i]: 'active', ...Object.fromEntries(Array.from({ length: f.i }, (_, k) => [k, 'done'])) }
        )
    };
}

function tryCatchSpec() {
    return {
        title: 'Luồng điều khiển try - catch - finally',
        codeLines: [
            'try {',
            '    int r = 10 / 0; // ném ArithmeticException',
            '} catch (ArithmeticException e) {',
            '    System.out.println("Bắt lỗi chia 0");',
            '} finally {',
            '    System.out.println("Luôn dọn dẹp ở đây");',
            '}'
        ],
        steps: [
            { line: 1, cells: ['try', 'catch', 'finally'], active: 0, msg: 'Vào khối try, thực hiện 10 / 0 → phát sinh ArithmeticException.' },
            { line: 3, cells: ['try (lỗi)', 'catch (khớp)', 'finally'], active: 1, msg: 'Nhảy tới khối catch khớp kiểu ArithmeticException và xử lý lỗi.' },
            { line: 5, cells: ['try (lỗi)', 'catch (xong)', 'finally'], active: 2, msg: 'Khối finally luôn luôn chạy trước khi rời phương thức.' }
        ],
        render: (stage, f) => renderCells(stage, f.cells.map((v, i) => ({ val: v, sub: i === f.active ? 'đang chạy' : '' })), { [f.active]: 'active' })
    };
}

export function mountBasics(host, piece) {
    const id = piece.id;
    let spec;
    if (id === 'cb-java-program-bytecode') {
        spec = pipelineSteps('Quy trình biên dịch và chạy Java', ['Main.java', 'javac', 'Main.class', 'JVM'], [
            'Viết mã nguồn Java trong tệp .java (tên lớp public trùng tên tệp).',
            'Trình biên dịch javac kiểm tra cú pháp và kiểu dữ liệu.',
            'Sinh mã trung gian bytecode (.class) độc lập hệ điều hành.',
            'Máy ảo JVM nạp bytecode và thực thi từ hàm main(String[] args).'
        ]);
    } else if (id === 'cb-primitive-types-variables' || id === 'cb-operators-expressions') {
        spec = {
            title: 'Đánh giá biểu thức và ép kiểu trong Java',
            steps: [
                { cells: ['int a = 5', 'int b = 2', 'a / b = 2'], idx: 2, msg: 'Chia hai số nguyên: 5 / 2 cho kết quả nguyên 2 (cắt phần thập phân).' },
                { cells: ['(double) a', '5.0 / 2', '2.5'], idx: 2, msg: 'Ép kiểu (double)a trước khi chia cho kết quả thực 2.5.' },
                { cells: ['a++', 'a = 6', 'trả về 5'], idx: 0, msg: 'Hậu tố a++ dùng giá trị cũ 5 trong biểu thức rồi mới tăng a lên 6.' }
            ],
            render: (s, f) => renderCells(s, f.cells, { [f.idx]: 'active' })
        };
    } else if (id === 'cb-branching-if-switch') {
        spec = {
            title: 'Rẽ nhánh if-else và switch-case',
            steps: [
                { cells: ['score = 82', 'score >= 80?', 'true → B'], idx: 1, msg: 'Kiểm tra nhánh đầu tiên thỏa điều kiện rồi dừng chuỗi if-else-if.' },
                { cells: ['day = 2', 'case 2:', 'break!'], idx: 2, msg: 'switch nhảy thẳng tới case 2; cần break để tránh rơi xuống case 3.' }
            ],
            render: (s, f) => renderCells(s, f.cells, { [f.idx]: 'active' })
        };
    } else if (id === 'cb-loops-break-continue') {
        spec = loopSpec();
    } else if (id === 'cb-methods-intro' || id === 'cb-variable-scope' || id === 'cb-coding-style') {
        spec = pipelineSteps('Khung gọi phương thức và phạm vi biến', ['main()', 'add(3, 4)', 'trả về 7', 'pop khung'], [
            'main() chuẩn bị đối số và gọi add(3, 4).',
            'Khung hàm add được cấp phát với biến cục bộ x=3, y=4.',
            'Hàm thực hiện return x + y = 7 về nơi gọi.',
            'Khung hàm add bị giải phóng; biến cục bộ x, y hết phạm vi.'
        ]);
    } else if (id === 'cb-scanner-io-format' || id === 'cb-io-streams-files' || id === 'cb-text-binary-serialization') {
        spec = pipelineSteps('Luồng vào/ra (I/O Stream)', ['Tệp / Bàn phím', 'Reader / Scanner', 'Xử lý', 'close()'], [
            'Mở nguồn dữ liệu đầu vào (System.in hoặc FileInputStream).',
            'Đọc theo token, dòng văn bản hoặc byte qua bộ đệm.',
            'Xử lý, định dạng xuất với printf hoặc ghi ra luồng đích.',
            'Đóng luồng (hoặc dùng try-with-resources) để tránh rò rỉ tài nguyên.'
        ]);
    } else if (id === 'cb-array-1d' || id === 'cb-array-methods' || id === 'cb-ex-array-sort-search') {
        spec = array1dSpec();
    } else if (id === 'cb-array-2d') {
        spec = array2dSpec();
    } else if (id === 'cb-java-api-math-string' || id === 'cb-ex-string-vigenere') {
        spec = vigenereSpec();
    } else if (id === 'cb-reference-vs-primitive') {
        spec = {
            title: 'Biến nguyên thủy vs Biến tham chiếu',
            steps: [
                { cells: ['int x = 5', 'int y = x', 'y = 9 → x=5'], idx: 2, msg: 'Nguyên thủy sao chép giá trị: đổi y không ảnh hưởng x.' },
                { cells: ['int[] a = {1,2}', 'int[] b = a', 'b[0]=9 → a[0]=9'], idx: 2, msg: 'Tham chiếu sao chép địa chỉ: a và b cùng trỏ một mảng trên Heap.' }
            ],
            render: (s, f) => renderCells(s, f.cells, { [f.idx]: 'active' })
        };
    } else if (id === 'cb-class-object-constructor' || id === 'cb-static-members' || id === 'cb-class-scope-this') {
        spec = {
            title: 'Lớp, đối tượng, this và static',
            steps: [
                { cells: ['static count=0', 'new Student()', 'this.name'], idx: 1, msg: 'new cấp phát đối tượng mới và gọi constructor khởi tạo trường thực thể.' },
                { cells: ['static count=1', 's1.name="An"', 's2.name="Bình"'], idx: 0, msg: 'Biến static thuộc về lớp và dùng chung cho mọi đối tượng.' }
            ],
            render: (s, f) => renderCells(s, f.cells, { [f.idx]: 'active' })
        };
    } else if (id === 'cb-access-control' || id === 'cb-encapsulation-debug' || id === 'cb-packages-arraylist') {
        spec = {
            title: 'Đóng gói và kiểm soát truy cập',
            steps: [
                { cells: ['private balance', 'getBalance()', 'deposit(100)'], idx: 0, msg: 'Trường dữ liệu để private để ngăn gán giá trị âm trực tiếp từ bên ngoài.' },
                { cells: ['deposit(-50)', 'kiểm tra < 0', 'từ chối!'], idx: 2, msg: 'Phương thức public kiểm tra bất biến trước khi cập nhật trạng thái.' }
            ],
            render: (s, f) => renderCells(s, f.cells, { [f.idx]: 'active' })
        };
    } else if (id === 'cb-interface-contract' || id === 'cb-inheritance-oop') {
        spec = {
            title: 'Kế thừa (extends) và Giao diện (implements)',
            steps: [
                { cells: ['Animal', 'Dog extends Animal', 'super()'], idx: 2, msg: 'Lớp con kế thừa thuộc tính/phương thức lớp cha và gọi super() để khởi tạo.' },
                { cells: ['Drawable', 'Circle implements', '@Override draw()'], idx: 2, msg: 'Lớp cài đặt giao diện phải hiện thực mọi phương thức trong hợp đồng.' }
            ],
            render: (s, f) => renderCells(s, f.cells, { [f.idx]: 'active' })
        };
    } else if (id === 'cb-exceptions-checked-unchecked' || id === 'cb-try-catch-finally-throw') {
        spec = tryCatchSpec();
    } else {
        // cb-swing-gui-basics
        spec = pipelineSteps('Cây thành phần giao diện Swing', ['JFrame', 'JPanel', 'JButton / JLabel', 'ActionListener'], [
            'JFrame là cửa sổ cấp cao chứa toàn bộ giao diện.',
            'JPanel gom nhóm các thành phần con theo LayoutManager.',
            'Thêm các điều khiển tương tác như JButton, JTextField, JLabel.',
            'Gắn ActionListener để phản hồi khi người dùng bấm nút.'
        ]);
    }
    createStepper(host, { subtitle: piece.summary, track: piece.track, ...spec });
}
