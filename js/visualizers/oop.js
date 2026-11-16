import { createStepper, el, renderCells } from './shared.js';

function cardsSpec(title, frames, codeLines = null) {
    return {
        title,
        ...(codeLines ? { codeLines } : {}),
        steps: frames.map(f => ({ ...f })),
        render: (stage, f) => renderCells(
            stage,
            f.cells.map((v, i) => ({ val: v, sub: f.subs?.[i] ?? '' })),
            { ...(f.active != null ? { [f.active]: 'active' } : {}), ...(f.done ? Object.fromEntries(f.done.map(i => [i, 'done'])) : {}) }
        )
    };
}

function streamPipelineSpec() {
    const nums = [1, 2, 3, 4, 5, 6];
    return {
        title: 'Stream API: Lazy Pipeline (filter → map → collect)',
        codeLines: [
            'list.stream()',
            '    .filter(x -> x % 2 == 0)',
            '    .map(x -> x * x)',
            '    .collect(Collectors.toList());'
        ],
        steps: [
            { line: 0, cells: nums.map(String), active: -1, done: [], msg: 'Khởi tạo Stream nguồn [1, 2, 3, 4, 5, 6] — chưa tính toán gì (Lazy).' },
            { line: 1, cells: ['2', '4', '6'], active: 0, done: [0, 1, 2], msg: 'filter(chẵn): giữ lại phần tử chẵn [2, 4, 6].' },
            { line: 2, cells: ['4', '16', '36'], active: 1, done: [0, 1, 2], msg: 'map(x -> x*x): biến đổi từng phần tử thành bình phương.' },
            { line: 3, cells: ['[4, 16, 36]'], active: 0, done: [0], msg: 'Phép toán kết thúc collect() kích hoạt toàn bộ pipeline và trả về List.' }
        ],
        render: (s, f) => renderCells(s, f.cells, { ...(f.active >= 0 ? { [f.active]: 'active' } : {}), ...Object.fromEntries((f.done || []).map(i => [i, 'done'])) })
    };
}

function decoratorSpec() {
    return cardsSpec('Mẫu Decorator: Bọc nhiều lớp hành vi động', [
        { cells: ['Coffee (20k)'], subs: ['lõi'], active: 0, msg: 'Bắt đầu bằng đối tượng lõi SimpleCoffee giá 20k.' },
        { cells: ['MilkDecorator', 'Coffee (20k)'], subs: ['+5k', 'lõi'], active: 0, done: [1], msg: 'Bọc thêm MilkDecorator: ủy quyền cost() + cộng 5k.' },
        { cells: ['SugarDecorator', 'MilkDecorator', 'Coffee'], subs: ['+2k', '+5k', '20k → 27k'], active: 0, done: [1, 2], msg: 'Bọc tiếp SugarDecorator: tổng 27k mà không sửa lớp Coffee!' }
    ]);
}

function observerSpec() {
    return cardsSpec('Mẫu Observer: Subject thông báo tới các Observer', [
        { cells: ['Subject (state=1)', 'Observer A', 'Observer B'], subs: ['nguồn', 'đã đăng ký', 'đã đăng ký'], active: 0, msg: 'Subject thay đổi trạng thái sang 1.' },
        { cells: ['Subject.notifyAll()', 'A.update(1)', 'B.update(1)'], subs: ['phát tin', 'cập nhật', 'cập nhật'], active: 1, done: [0, 2], msg: 'Subject gọi update() trên mọi Observer đang theo dõi.' }
    ]);
}

function strategySpec() {
    return cardsSpec('Mẫu Strategy: Hoán đổi thuật toán lúc chạy', [
        { cells: ['Context', 'BubbleSort'], subs: ['ủy quyền', 'chiến lược 1'], active: 1, msg: 'Context đang giữ chiến lược BubbleSort cho mảng nhỏ.' },
        { cells: ['Context', 'QuickSort'], subs: ['setStrategy()', 'chiến lược 2'], active: 1, done: [0], msg: 'Đổi sang QuickSort lúc chạy mà không sửa mã Context.' }
    ], [
        'interface SortStrategy { void sort(int[] a); }',
        'ctx.setStrategy(new QuickSort());',
        'ctx.execute(data);'
    ]);
}

export function mountOop(host, piece) {
    const id = piece.id;
    let spec;
    if (id === 'oop-stack-heap-memory' || id === 'oop-variables-types') {
        spec = cardsSpec('Bộ nhớ Stack & Heap trong JVM', [
            { cells: ['Stack: x=10', 'Stack: ref p', 'Heap: Point(1,2)'], subs: ['nguyên thủy', 'địa chỉ', 'đối tượng'], active: 1, done: [2], msg: 'Biến cục bộ và tham chiếu nằm trên Stack; đối tượng new Point(1,2) nằm trên Heap.' },
            { cells: ['Stack: ref q = p', 'Heap: Point(1,2)'], subs: ['cùng trỏ', 'ref count = 2'], active: 0, done: [1], msg: 'Gán q = p chỉ sao chép địa chỉ trên Stack; cả hai cùng trỏ một vùng Heap.' }
        ]);
    } else if (id === 'oop-parameter-passing') {
        spec = cardsSpec('Truyền tham trị (Pass-by-Value) trong Java', [
            { cells: ['foo(int a)', 'a = 99', 'caller x = 5'], subs: ['bản sao', 'đổi cục bộ', 'giữ nguyên'], active: 2, msg: 'Kiểu nguyên thủy truyền bản sao giá trị nên x bên ngoài không đổi.' },
            { cells: ['bar(Box b)', 'b.val = 99', 'caller box.val = 99'], subs: ['bản sao địa chỉ', 'sửa Heap', 'thấy thay đổi'], active: 2, msg: 'Tham chiếu truyền bản sao địa chỉ: thay đổi thuộc tính qua b ảnh hưởng đối tượng thật.' }
        ]);
    } else if (id === 'oop-paradigm-class-object' || id === 'oop-encapsulation-modifiers' || id === 'oop-constructors-this' || id === 'oop-java-api-wrapper') {
        spec = cardsSpec('Thiết kế lớp, đóng gói và Constructor', [
            { cells: ['class Account', 'private balance', 'public deposit()'], subs: ['bản thiết kế', 'ẩn dữ liệu', 'giao diện'], active: 1, msg: 'Che giấu trạng thái bên trong bằng private, chỉ mở thao tác hợp lệ.' },
            { cells: ['new Account(100)', 'this.balance = 100', 'Integer.valueOf(100)'], subs: ['khởi tạo', 'this', 'Wrapper'], active: 0, done: [1], msg: 'Constructor khởi tạo bất biến ngay khi tạo đối tượng.' }
        ]);
    } else if (id === 'oop-inheritance-super' || id === 'oop-object-class-contract' || id === 'oop-casting-instanceof' || id === 'oop-polymorphism-dispatch') {
        spec = cardsSpec('Đa hình động (Dynamic Dispatch) và Upcasting', [
            { cells: ['Animal a = new Dog()', 'a.speak()', 'Dog.speak()'], subs: ['kiểu tĩnh Animal', 'JVM tra Heap', 'chạy Dog!'], active: 2, done: [0], msg: 'Kiểu tĩnh là Animal nhưng JVM gọi phương thức ghi đè của đối tượng thật Dog lúc chạy.' },
            { cells: ['a instanceof Dog', '(Dog) a', 'a.equals(b)'], subs: ['kiểm tra an toàn', 'downcast', 'Object contract'], active: 0, done: [2], msg: 'Kiểm tra instanceof trước khi ép kiểu xuống để tránh ClassCastException.' }
        ]);
    } else if (id === 'oop-uml-class-diagram' || id === 'oop-solid-principles') {
        spec = cardsSpec('Quan hệ UML & Nguyên lý SOLID', [
            { cells: ['IS-A (extends)', 'HAS-A (Composition)', 'USES-A (Dependency)'], subs: ['kế thừa', 'chứa/sở hữu', 'phụ thuộc'], active: 1, msg: 'Ưu tiên Composition (HAS-A) và phụ thuộc vào Interface (DIP) để giảm ghép nối.' },
            { cells: ['SRP', 'OCP', 'LSP · ISP · DIP'], subs: ['1 trách nhiệm', 'mở rộng, đóng sửa', 'linh hoạt'], active: 0, done: [1, 2], msg: '5 nguyên lý SOLID giúp mã dễ bảo trì và mở rộng.' }
        ]);
    } else if (id === 'oop-jcf-hierarchy-list' || id === 'oop-set-queue-map' || id === 'oop-iterator-collections-utils') {
        spec = cardsSpec('Java Collections Framework: List · Set · Map', [
            { cells: ['List (có thứ tự, trùng)', 'Set (duy nhất)', 'Map (Key → Value)'], subs: ['ArrayList/LinkedList', 'HashSet/TreeSet', 'HashMap/TreeMap'], active: 0, msg: 'Chọn cấu trúc phù hợp: List giữ thứ tự, Set loại trùng, Map tra cứu theo khóa.' },
            { cells: ['Iterator.hasNext()', 'it.next()', 'it.remove()'], subs: ['kiểm tra', 'lấy phần tử', 'xóa an toàn'], active: 2, msg: 'Dùng it.remove() khi đang duyệt để tránh ConcurrentModificationException.' }
        ]);
    } else if (id === 'oop-design-patterns-intro' || id === 'oop-singleton-pattern') {
        spec = cardsSpec('Mẫu Singleton: Đảm bảo duy nhất một thể hiện', [
            { cells: ['private static instance = null', 'private Constructor()', 'getInstance()'], subs: ['biến lớp', 'chặn new', 'điểm truy cập'], active: 2, msg: 'Lần gọi đầu tiên tạo instance; các lần sau trả về đúng thể hiện đó.' },
            { cells: ['getInstance() #1', 'getInstance() #2', 's1 == s2 (true)'], subs: ['tạo mới', 'trả lại cũ', 'cùng địa chỉ'], active: 2, done: [0, 1], msg: 'Mọi nơi gọi đều dùng chung một đối tượng duy nhất.' }
        ]);
    } else if (id === 'oop-factory-method-abstract-factory') {
        spec = cardsSpec('Factory Method & Abstract Factory', [
            { cells: ['Creator.create()', 'ConcreteA → ProductA', 'ConcreteB → ProductB'], subs: ['trừu tượng', 'nhánh A', 'nhánh B'], active: 0, msg: 'Tách việc khởi tạo đối tượng ra khỏi mã sử dụng.' }
        ]);
    } else if (id === 'oop-adapter-facade' || id === 'oop-bridge-proxy') {
        spec = cardsSpec('Mẫu Cấu trúc: Adapter · Facade · Bridge · Proxy', [
            { cells: ['Client', 'Adapter / Proxy / Facade', 'Service / Adaptee'], subs: ['gọi chuẩn', 'chuyển đổi / đơn giản / kiểm soát', 'cài đặt thật'], active: 1, msg: 'Các mẫu cấu trúc đặt lớp trung gian để chuyển đổi giao diện, đơn giản hóa hoặc kiểm soát truy cập.' }
        ]);
    } else if (id === 'oop-decorator-pattern') {
        spec = decoratorSpec();
    } else if (id === 'oop-strategy-pattern' || id === 'oop-ex-integration') {
        spec = strategySpec();
    } else if (id === 'oop-observer-pattern') {
        spec = observerSpec();
    } else if (id === 'oop-template-method-iterator') {
        spec = cardsSpec('Template Method: Khung thuật toán cố định', [
            { cells: ['step1() (cha)', 'step2() (con ghi đè)', 'step3() (cha)'], subs: ['cố định', 'tùy biến', 'cố định'], active: 1, done: [0, 2], msg: 'Lớp cha định nghĩa khung quy trình final, lớp con chỉ điền các bước trừu tượng.' }
        ]);
    } else if (id === 'oop-command-state' || id === 'oop-chain-mediator-visitor') {
        spec = cardsSpec('Mẫu Hành vi: Command · State · Chain · Mediator · Visitor', [
            { cells: ['Request / Event', 'Handler / State / Command', 'Action'], subs: ['đóng gói', 'điều phối / chuyển trạng thái', 'thực thi / hoàn tác'], active: 1, msg: 'Đóng gói yêu cầu hoặc trạng thái thành đối tượng để tách người gửi và người xử lý.' }
        ]);
    } else if (id === 'oop-generic-methods-bounded' || id === 'oop-generics-wildcards' || id === 'oop-type-erasure-restrictions') {
        spec = cardsSpec('Java Generics: Wildcards (PECS) & Type Erasure', [
            { cells: ['<? extends T>', '<? super T>', 'Type Erasure → Object'], subs: ['Producer: chỉ đọc T', 'Consumer: chỉ ghi T', 'biên dịch xóa T'], active: 0, msg: 'PECS: Producer Extends (đọc an toàn), Consumer Super (ghi an toàn); runtime xóa kiểu T.' }
        ]);
    } else if (id === 'oop-functional-interface-lambda' || id === 'oop-standard-functional-interfaces') {
        spec = cardsSpec('Lambda & Functional Interfaces (java.util.function)', [
            { cells: ['Predicate<T>', 'Function<T,R>', 'Consumer<T> · Supplier<T>'], subs: ['T → boolean', 'T → R', 'T → void / () → T'], active: 1, msg: 'Biểu thức lambda (x -> ...) cài đặt ngắn gọn giao diện chỉ có 1 phương thức trừu tượng.' }
        ]);
    } else if (id === 'oop-stream-api-basics' || id === 'oop-stream-operations-collectors') {
        spec = streamPipelineSpec();
    } else if (id === 'oop-ex-matrix') {
        spec = cardsSpec('MySquareMatrix: Cộng & chuyển vị ma trận', [
            { cells: ['A[i][j]', '+', 'B[i][j]'], subs: ['ma trận A', 'từng ô', 'ma trận B'], active: 1, msg: 'Cộng hai ma trận vuông cùng kích thước và duyệt đường chéo chính.' }
        ]);
    } else if (id === 'oop-ex-statistics') {
        spec = cardsSpec('Statistics & MyList: Trung bình và Phương sai', [
            { cells: ['data = [2, 4, 6]', 'mean = 4.0', 'var = 2.67'], subs: ['mẫu', 'trung bình', 'phương sai'], active: 2, done: [0, 1], msg: 'Tính mean và variance trên cấu trúc MyArrayList / MyLinkedList tự cài đặt.' }
        ]);
    } else {
        // oop-ex-student-manager
        spec = cardsSpec('StudentManager: Lọc & Sắp xếp theo Comparator', [
            { cells: ['An (8.5)', 'Bình (6.0)', 'Chi (9.2)'], subs: ['lọc ≥ 8.0', 'loại', 'lọc ≥ 8.0'], active: 1, msg: 'Kết hợp Comparable/Comparator và Stream/Collection để lọc và sắp xếp sinh viên.' },
            { cells: ['Chi (9.2)', 'An (8.5)'], subs: ['#1', '#2'], active: 0, done: [1], msg: 'Sắp xếp giảm dần theo điểm trung bình.' }
        ]);
    }
    createStepper(host, { subtitle: piece.summary, track: piece.track, ...spec });
}
