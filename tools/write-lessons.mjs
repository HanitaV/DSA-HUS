// Regenerate concise lessons from reviewed teaching notes and citations.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(root + 'data/pieces.json', 'utf8'));
const notes = JSON.parse(readFileSync(root + 'content/notes.json', 'utf8'));
mkdirSync(root + 'content/lessons', { recursive: true });
for (const piece of data.pieces) {
    const n = notes[piece.id];
    if (!Array.isArray(n) || n.length < 4) throw new Error(`Thiếu ghi chú bài học: ${piece.id}`);
    const source = piece.sources.map(s => `${s.file.split('/').at(-1)}, trang ${s.page}`).join('; ');
    const content = `## Nội dung chính\n\n${n.slice(0, -2).join('\n\n')}\n\n## Tự kiểm tra\n\n${n.at(-2)}\n\n## Gợi ý đối chiếu\n\n${n.at(-1)}\n\n## Đọc cùng tài liệu\n\nBài học được biên soạn từ: ${source}. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.\n`;
    piece.lesson = `content/lessons/${piece.id}.md`;
    writeFileSync(root + piece.lesson, content);
}
writeFileSync(root + 'data/pieces.json', JSON.stringify(data, null, 2) + '\n');
console.log(`Đã tạo ${data.pieces.length} bài học.`);
