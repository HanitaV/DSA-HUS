# Bản đồ kiến thức HUS

Website học tập tĩnh bằng tiếng Việt, tổ chức kiến thức thành các mảnh dùng chung giữa hai khóa **MAT3514 – Cấu trúc dữ liệu và giải thuật** và **MAT3504 – Thiết kế và đánh giá thuật toán**. Hiện có 104 mảnh, 183 cạnh và 104 bài học ngắn có câu hỏi tự kiểm tra, gợi ý và nguồn trang PDF.

Đồ thị là lối điều hướng chính. Chọn một mảnh để xem tiên quyết, ứng dụng và các hướng học tiếp. Có thể tìm kiếm không dấu, dùng danh sách bằng bàn phím, học theo chương và đánh dấu đã học. Tiến độ dùng chung giữa các khóa, lưu tại trình duyệt hiện tại; khi localStorage bị chặn, site vẫn dùng được và thông báo không thể lưu lâu dài.

## Chạy local

Cần Node.js 18 trở lên; khuyến nghị Node.js 22. Không cần cài gói hoặc build để chạy website:

```powershell
npm run serve
```

Mở **http://127.0.0.1:4173**. Dừng bằng Ctrl+C. Có thể đổi cổng bằng `$env:PORT='4200'`. Không mở `index.html` trực tiếp qua `file://` vì trình duyệt chặn việc tải dữ liệu bằng fetch.

KaTeX và font đã được lưu trong `assets/`, nên giao diện không cần gọi CDN. Sau khi máy chủ local chạy, có thể dùng site khi không kết nối Internet.

## Cấu trúc

```text
index.html                 Đồ thị, tìm kiếm, chi tiết và lộ trình khóa học
lesson.html                Trang bài học theo mã mảnh trong URL
css/style.css              Giao diện desktop, mobile và reduced motion
js/model.mjs               Tìm kiếm, tiên quyết, tiến độ, đề xuất, URL
js/graph.js                Module SVG tái sử dụng, bố trí, kéo và phóng to
js/app.js                  Điều phối không gian học
js/common.js               Tải dữ liệu, Markdown an toàn, KaTeX, nguồn
js/lesson.js               Trang bài học và các kết nối
data/pieces.json           Mảnh và cạnh dùng chung
data/courses/index.json    Mã các khóa được hiển thị
data/courses/*.json        Mục tiêu, đầu ra và chương của từng khóa
data/documents.json        Danh mục máy đọc được của toàn bộ docs/
content/notes.json         Ghi chú biên soạn để tái tạo các bài học hiện tại
content/lessons/*.md       Nội dung bài học được site tải trực tiếp
docs/                     Tài liệu gốc, giữ nguyên tên và đường dẫn
assets/                   Font và KaTeX, kèm giấy phép
tools/                    Máy chủ local, kiểm kê, kiểm tra, tạo artifact
.github/workflows/pages.yml
DOCUMENTS.md               Danh mục tài liệu có liên kết
DESIGN.md                  Lý do thiết kế và quy ước điều hướng
REVIEW.md                  Những điểm nội dung cần người dùng kiểm tra
```

## Thêm mảnh kiến thức

1. Đọc tài liệu trong `docs/`; lấy số trang theo thứ tự trong tệp PDF, bắt đầu từ 1. Slide có số in khác với thứ tự trang vẫn được dẫn bằng thứ tự trang PDF.
2. Thêm vào mảng `pieces` trong `data/pieces.json`:

```json
{
  "id": "ten-manh-moi",
  "title": "Tên mảnh mới",
  "type": "concept",
  "difficulty": 1,
  "summary": "Tóm tắt 1–2 câu, công thức như $T(n)=O(n)$.",
  "sources": [{ "file": "docs/duong-dan-tai-lieu.pdf", "page": "3-5" }],
  "tags": ["chu-de"],
  "lesson": "content/lessons/ten-manh-moi.md"
}
```

Đường dẫn ví dụ cần được thay bằng tệp thật. `type` nhận `concept`, `theorem`, `formula`, `example`, `exercise`; `difficulty` nhận 1–3. Giữ mã mảnh ổn định để liên kết và tiến độ cũ tiếp tục hoạt động.

3. Viết bài Markdown ở đường dẫn `lesson`. Trình đọc hỗ trợ tiêu đề, đoạn văn, danh sách `-`, mã nội dòng, khối mã và công thức `$...$` / `$$...$$`. HTML thô được hiển thị như văn bản. Các liên kết tiên quyết, ứng dụng và nguồn được thêm tự động từ dữ liệu.
4. Thêm cạnh vào mảng `edges` cùng tệp. `prerequisite` hướng từ mảnh cần học trước tới mảnh học sau; `applies` hướng từ kiến thức tới nơi áp dụng và phải có ghi chú ngắn; `related` là liên quan hai chiều khi hiển thị.

```json
{ "source": "manh-co-san", "target": "ten-manh-moi", "relation": "prerequisite" }
```

5. Nếu bổ sung kiến thức ngoài `docs/`, đặt `"source": "ngoài docs"` trên mảnh và giải thích rõ phần bổ sung trong bài học cùng `REVIEW.md`. Site hiển thị nhãn yêu cầu kiểm tra. `sources` vẫn phải ghi nguồn đang được dùng; không gán một trang không chứa nội dung đó.
6. Chạy `npm run validate:strict`.

Các bài hiện tại được tạo từ `content/notes.json`. Muốn tái tạo, sửa ghi chú tương ứng rồi chạy `npm run lessons`. Mỗi mục ghi chú gồm các đoạn giảng, tiếp theo là câu hỏi và đáp án ở hai phần tử cuối. Lệnh này **ghi lại toàn bộ Markdown và trường lesson**; hãy lưu các chỉnh sửa viết trực tiếp trong bài trước khi chạy. Với bài mới viết tay, không cần chạy lệnh tái tạo.

## Thêm khóa học

Tạo `data/courses/MA_MON.json` gồm `id`, `name`, `aim`, `outcomes` và `chapters`. Mỗi chương có `id`, `title`, `pieces` là danh sách mã mảnh theo thứ tự học. Thêm `MA_MON` vào `courses` trong `data/courses/index.json`.

Một mảnh có thể thuộc nhiều khóa, nhưng không lặp lại trong cùng khóa. Module đồ thị không chứa tên môn hay mã mảnh cụ thể; thêm môn chỉ cần thay dữ liệu. Nếu tiên quyết nằm ngoài khóa, bộ đề xuất chờ người học hoàn thành tiên quyết đó; bảng chi tiết dẫn sang chế độ Khám phá. MAT3504 hiện có chương nền tảng dùng chung để lộ trình bao gồm các tiên quyết cần thiết.

## Kiểm tra

```powershell
npm run validate:strict
npm test
```

Hai lệnh này dùng Node.js thuần. Validator kiểm tra ID, cạnh, chu trình tiên quyết, mã mảnh trong khóa, nguồn, bài học tồn tại, thứ tự tiên quyết và các dữ liệu bắt buộc. Các bài kiểm tra có cả dữ liệu lỗi cố ý để xác nhận validator thật sự từ chối những trường hợp bắt buộc.

Kiểm thử giao diện cần cài công cụ phát triển:

```powershell
npm ci
npm run test:browser
```

Trên Windows, kiểm thử dùng Edge đã cài. Trên Linux/macOS, chạy `npx playwright install chromium` trước. Bài kiểm thử tự khởi động máy chủ local nếu cần. Kết quả tạm và ảnh khi lỗi nằm trong `.cache/`, không đưa vào Git. Xem [VALIDATION.md](VALIDATION.md) về phạm vi đã kiểm tra.

## Kiểm kê lại tài liệu

```powershell
python -m pip install -r tools/requirements.txt
python tools/inventory.py
python tools/audit-sources.py
```

Lệnh đầu tạo `DOCUMENTS.md`, `data/documents.json` và bản trích xuất văn bản theo trang trong `.cache/documents/`. Lệnh sau đối chiếu các khoảng trang được dẫn và tạo `.cache/source-review.txt` phục vụ rà soát. DOCX không có số trang ổn định nên không tự suy diễn số trang. ZIP được lập mục lục và đọc các tệp mã/văn bản bên trong; tài liệu nhị phân khác được ghi nhận theo loại.

Trích xuất tự động không thay thế việc đọc hình, công thức và kiểm tra nội dung. Các trang rất ít chữ, bản scan và lỗi mã hóa được ghi nhận trong danh mục và `REVIEW.md`.

## Deploy GitHub Pages

Trong repository trên GitHub, mở **Settings → Pages → Build and deployment → Source → GitHub Actions**. Đẩy mã lên nhánh `main` hoặc `master`, hoặc chạy workflow bằng `workflow_dispatch`.

Workflow kiểm tra dữ liệu, chạy kiểm thử Node, tạo artifact rồi deploy. Pull request chỉ kiểm tra và không deploy. Artifact chỉ chứa website, dữ liệu và tài liệu học; không chứa `.agents/`, `.claude/`, node_modules hay bộ nhớ trích xuất. Site không cần build frontend. `npm run stage` chỉ sao chép nội dung công khai vào `.cache/pages` và thay thế artifact cũ ở đúng thư mục đó.

Mọi đường dẫn giao diện và dữ liệu đều tương đối, dùng được dưới `/DSA-HUS/`. URL chia sẻ có dạng:

```text
index.html#piece=big-o
index.html#course=MAT3514
index.html#course=MAT3514&piece=big-o
lesson.html#course=MAT3514&piece=big-o
```

Nguồn PDF được mở với `#page=N`; trình xem PDF của thiết bị có thể xử lý tham số này khác nhau. Tài liệu gốc khoảng 379 MB và được đưa vào artifact để các nguồn vẫn mở được. Trước khi công khai repository hoặc Pages, bạn cần tự xác nhận quyền chia sẻ các giáo trình có trong `docs/`.

Website đã được chuẩn bị trong workspace; chưa đẩy commit hay kích hoạt Pages trên tài khoản GitHub.
