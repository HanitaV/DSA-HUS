// Tạo bài học trực quan từ ghi chú đã rà soát. Không chèn liên kết PDF.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(root + 'data/pieces.json', 'utf8'));
const notes = JSON.parse(readFileSync(root + 'content/notes.json', 'utf8'));
const codePath = root + 'content/code-snippets.json';
const code = existsSync(codePath) ? JSON.parse(readFileSync(codePath, 'utf8')) : {};
mkdirSync(root + 'content/lessons', { recursive: true });

const flow = {
    algorithm: [
        'Bấm **Bước tiếp** và nhìn phần đang được tô màu: đó là chỗ code đang xử lý.',
        'Đổi dữ liệu mẫu hoặc nhập dữ liệu riêng, rồi đoán bước kế tiếp trước khi bấm.',
        'Chỉ khi hiểu bước chạy mới đọc phần ý chính và code bên dưới.'
    ],
    math: [
        'Xem hình hoặc bảng minh họa để thấy con số thay đổi thế nào.',
        'Đọc phần ý chính để biết kết luận cần nhớ.',
        'Phần này chỉ cần để giải thích vì sao thuật toán nhanh hay chậm; bạn có thể học sau khi đã viết được code.'
    ]
};

const force = process.argv.includes('--force');
let skipped = 0;
for (const piece of data.pieces) {
    // Lessons are hand-authored now; only regenerate files still in the old generated layout.
    const target = root + `content/lessons/${piece.id}.md`;
    if (!force && existsSync(target) && !readFileSync(target, 'utf8').startsWith('## Hình dung trực quan')) { skipped++; continue; }
    const n = notes[piece.id];
    if (!Array.isArray(n) || n.length < 4) throw new Error(`Thiếu ghi chú bài học: ${piece.id}`);
    const track = piece.track === 'math' ? 'math' : 'algorithm';
    const body = n.slice(0, -2).join('\n\n');
    const snippet = code[piece.id]
        ? `\n## Code mẫu\n\n\`\`\`java\n${code[piece.id]}\n\`\`\`\n`
        : '';
    const bridge = track === 'algorithm'
        ? '## Khi viết code cần nhớ\n\n- Xác định rõ đầu vào, đầu ra và điều kiện dừng.\n- Tự chạy tay một ví dụ nhỏ (3 đến 5 phần tử) và so với mô phỏng.\n- Thử các trường hợp biên: rỗng, một phần tử, giá trị trùng.\n'
        : '## Dùng kết quả này khi nào\n\n- Dùng để ước lượng thuật toán nhanh hay chậm trước khi code.\n- Không cần chứng minh lại mỗi lần; nhớ kết luận và điều kiện áp dụng.\n';
    const content = `## Hình dung trực quan\n\n${flow[track].map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n## Ý chính\n\n${body}\n${snippet}\n${bridge}\n## Tự kiểm tra\n\n${n.at(-2)}\n\n## Gợi ý đối chiếu\n\n${n.at(-1)}\n`;
    piece.lesson = `content/lessons/${piece.id}.md`;
    writeFileSync(root + piece.lesson, content);
}
writeFileSync(root + 'data/pieces.json', JSON.stringify(data, null, 2) + '\n');
console.log(`Đã tạo ${data.pieces.length - skipped} bài học, giữ nguyên ${skipped} bài viết tay (dùng --force để ghi đè).`);
