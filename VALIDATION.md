# Phạm vi kiểm tra và kết quả xác nhận

Tài liệu này ghi nhận các bước kiểm tra đã chạy sau lần chỉnh sửa cuối cùng và giải thích các khác biệt giữa ứng dụng đồ thị 3 cột với bộ kiểm tra landing page, bổ sung cho [DESIGN.md](DESIGN.md) và [REVIEW.md](REVIEW.md).

## 1. Dữ liệu kiến thức, nguồn và công thức

- `npm run validate:strict` (`node tools/validate.mjs --strict`): **đạt (0 lỗi, 0 cảnh báo)** trên 171 mảnh kiến thức, 317 cạnh quan hệ, 4 khóa học (`THCS4`, `OOP`, `MAT3514`, `MAT3504`), 171 tệp bài học và 0 mảnh đánh dấu `"ngoài docs"`.
- `python tools/inventory.py` và `python tools/audit-sources.py`: đã kiểm kê 604 tệp trong `docs/` (13.232 trang PDF/slide, chi tiết tại [DOCUMENTS.md](DOCUMENTS.md) và `data/documents.json`) và đối chiếu 276 trích dẫn nguồn trang của 171 mảnh với kết quả `problems: []`.
- Kiểm tra phân tích KaTeX qua `node_modules/katex`: toàn bộ 195 biểu thức `$...$` trong 104 `summary` và 104 bài học `content/lessons/*.md` biên dịch với **0 lỗi**.
- Làm sạch tiêu đề 4 mảnh (`generic-bubble-sort`, `tromino-tiling`, `ex-count-pairs`, `binomial-dp`) để không hiển thị dấu backtick hoặc cú pháp `$...$` thô trong nhãn SVG của đồ thị, danh sách thanh bên và thẻ `<title>`.

## 2. Kiểm thử đơn vị và kiểm thử trình duyệt

- `npm test` (`tools/model.test.mjs`, `tools/validator.test.mjs`): **13/13 bài kiểm tra đạt**, bao gồm:
  - Chuẩn hóa tìm kiếm tiếng Việt bỏ dấu, chữ `đ`/`Đ` và dạng tổ hợp NFD.
  - Điều kiện sẵn sàng học theo tiên quyết và gợi ý theo thứ tự chương (kể cả khi tiên quyết nằm ngoài khóa).
  - Xử lý khi `localStorage` bị chặn hoặc chứa JSON hỏng, và ghép/tách route hash `#course=...&piece=...`.
  - Xác nhận validator từ chối ID trùng, cạnh treo, chu trình tiên quyết, mảnh không tồn tại trong khóa và mảnh thiếu nguồn.
- `npm run test:browser` (`tools/browser-tests/learning.spec.js`, Playwright trên Microsoft Edge headless): **10/10 bài kiểm tra đạt**, bao gồm:
  - Chế độ Khám phá với 71 nút cốt lõi mặc định (`concept`, `theorem`, `formula`), bảng chi tiết đóng sẵn khi mở `/` và mở theo lựa chọn, mở rộng lên 104 nút khi bật `Hiện ví dụ & bài tập`, tìm kiếm không dấu, chọn mảnh bằng bàn phím, đóng chi tiết `#close-detail`, danh sách trống và skip link giữ nguyên URL mảnh đang học.
  - Chế độ Theo khóa học (`MAT3504` với 8 chương, `MAT3514`), đánh dấu/bỏ đánh dấu hoàn thành đồng bộ giữa các khóa và lưu qua reload.
  - Trang bài học `lesson.html`: hiển thị tiêu đề, mục Tự kiểm tra, công thức KaTeX cục bộ (`.katex-error` = 0), vùng chờ hoạt ảnh `#algorithm-animation`, và quay về đúng vị trí khóa học.
  - Tình huống chặn `localStorage`: hiển thị thông báo không lưu được và vẫn cho phép học trong phiên.
  - Kiểm tra HTTP 200 cho toàn bộ 104 tệp bài học và toàn bộ tệp PDF được trích dẫn.
  - Giao diện mobile/tablet (`390px`, `320px`, `768px`, `1024px`) với `prefers-reduced-motion: reduce`: mở thanh bên bằng `#sidebar-toggle`, `<h1>` hiển thị ở mobile, không tràn ngang trên cả `index.html` lẫn `lesson.html` (kể cả tại `320px`).
  - Nhãn hiển thị trong danh sách và đồ thị SVG (đủ 104 nút) không chứa `$` hoặc backtick thô.
  - Thanh bên thu gọn desktop (`#collapse-sidebar` / `#reopen-sidebar`), thanh `Bộ lọc` (`#filter-toggle`), đổi hướng bố cục DAG (`LR` ↔ `TB`), bật/tắt loại cạnh (`Tiên quyết`, `Áp dụng`, `Liên quan`), mục `Ví dụ & bài tập liên quan` trong `#detail`, và minimap SVG tương tác (`#minimap`).
  - Xử lý URL không hợp lệ và nút Back lịch sử trình duyệt.
  - Thao tác touchpad/trackpad laptop và cảm ứng: vuốt 2 ngón (2D pan với `deltaX`/`deltaY`), chụm thu phóng (`ctrlKey` / `gesturechange` / touch 2 ngón), và kéo-pan bắt đầu trực tiếp từ trên thẻ mà không mở nhầm bảng chi tiết.

## 3. Kiểm tra văn bản, hiệu năng và bộ kiểm tra landing page

Các công cụ của skill `design-taste-frontend` đã được chạy trên phiên bản nâng cấp:

- `copy-lint.mjs --kind software`:
  - `index.html` (119 từ): **0 FAIL, 0 WARN**.
  - `lesson.html` (24 từ): **0 FAIL, 0 WARN**.
- `perf.mjs index.html`: **0 FAIL, 2 WARN** (chỉ cảnh báo dung lượng tệp font `190.9 KiB` cho 4 biến thể `Instrument Sans` lưu cục bộ).
  - Tại `1440px`: tổng truyền tải `320.3 KiB`, 20 yêu cầu, 0 yêu cầu lỗi, CLS `0.000`, FCP `156 ms`, LCP `156 ms`, blocking time `0 ms`, 1 họ font (`Instrument Sans`).
  - Tại `390px`: tổng truyền tải `319.9 KiB`, 19 yêu cầu, 0 yêu cầu lỗi, CLS `0.000`, FCP `108 ms`, LCP `108 ms`, blocking time `0 ms`.
- `consistency.mjs --quick --widths 1440,390`:
  - Đã kiểm tra và xác nhận **PASS** các tiêu chí cốt lõi cho ứng dụng web: `text-contrast`, `contrast`, `font-load`, `one-heading`, `heading-order`, `heading-scale`, `off-viewport` (0 lỗi tại `320x640` và `1280..768`), `collide`, `tap-size`, `a11y-name`, `menu-toggle`, `focus-ring`, `focus-visible`, `focus-hidden`, `lang`, `page-meta`, `hero-enter`.
  - Đã xử lý tình trạng tràn hộp `<select id="course-select">` với tên môn dài (`white-space: nowrap; text-overflow: ellipsis`), vùng nhìn đồ thị DAG responsive theo chiều cao `filter-bar`, `text-wrap: balance` cho `<h1>` trên `390px`, căn lề `.lesson-footer` ở `820px`/`1024px` và ngắt từ tên tệp nguồn dài ở `320px`.

### Khác biệt có chủ đích với bộ kiểm tra landing page

Theo định hướng tại [DESIGN.md](DESIGN.md), giao diện chính là **không gian làm việc đồ thị 3 cột** (`app-shell`) thay cho trang landing cuộn theo màn hình nên các quy tắc đặc thù landing page trong `consistency.mjs` (tổng `154 FAIL, 21 WARN` ở lần chạy nhanh `1440,390`) và `assets/layout/check.mjs` không áp dụng trực tiếp:

- **Cấu trúc trang và hero (`hero-fill`, `hero-screen`, `section-height`, `section-air`, `one-section`, `container-edges`, `cta`, `copy-headline`, `empty-area`)**: Bộ kiểm tra kỳ vọng mỗi khối là `<section>` cao `100svh` trong `.wrap` với hero chữ và nút CTA chiếm trọn màn hình đầu (và `assets/layout/check.mjs` lỗi `r.sections is not iterable` vì `<main>` là cột làm việc trung tâm). Ứng dụng đưa khung đồ thị SVG tương tác lên ngay màn hình đầu; bộ đo hàng HTML nhận nhầm vùng vẽ `<svg>` là khoảng trống (`empty-area`).
- **Liên kết nội bộ dạng hash (`links`)**: Bộ kiểm tra xem nút chuyển chế độ `href="#"` và các liên kết trạng thái `#piece=...` là liên kết tới phần tử `#id` vắng mặt, trong khi đây là điều hướng trạng thái qua `hashchange`.
- **Phân cấp phụ và điều khiển ứng dụng (`heading-scale`, `field-label`, `run-on`, `flush`, `progress-bar`, `moment-none`, `visual-caption`, `overlap-text`/`cut-text`)**:
  - `#workspace-title` (`<h1>`) lớn hơn mọi `<h2>`, nhưng `<h2>` của danh sách thanh bên (`14px`) nhỏ hơn `<h2>` của bảng chi tiết (`24px`) để giữ mật độ danh sách trái.
  - `#status-filter` dùng `<label class="sr-only">` vì đặt ngay dưới tiêu đề `Mảnh kiến thức` và hiển thị sẵn `"Tất cả trạng thái"`.
  - Tiêu đề mục quan hệ trong `#detail` kèm bộ đếm số cạnh (`Có thể áp dụng trong 2`, `Cần biết trước 0`, `Học tiếp từ đây 10`).
  - Các cảnh báo `overlap-text` / `cut-text` phát sinh trên những mục nằm ngoài vùng cuộn của `#piece-list` và `aside#detail` (`overflow: auto`), không đè chữ khi hiển thị thực tế.
  - Chú giải đường nối (`Tiên quyết`, `Áp dụng`, `Liên quan`) ở thanh đáy đồ thị là bảng ký hiệu tương tác, không phải chú thích ảnh.
  - Thanh tiến độ là chức năng học tập cốt lõi; hiệu ứng chỉ giữ chuyển động vào nhẹ một lần ở tiêu đề thay cho hoạt cảnh bộ đếm.

## 4. Đóng gói artifact và phần còn để kiểm tra thủ công

- `npm run stage`: sao chép tệp công khai (website, dữ liệu, bài học, `docs/`, các tài liệu Markdown và không gồm `.agents/`, `.claude/`, `node_modules/`, `.taste-skill/`) vào `.cache/pages`.
- Các nội dung vẫn cần rà soát thủ công theo [REVIEW.md](REVIEW.md): đọc đối chiếu trực quan sách scan và slide chỉ có hình trong `docs/`, thẩm định sư phạm toàn bộ cạnh tiên quyết/liên quan và bổ sung hoạt ảnh thuật toán tương tác. (GitHub Pages đã được kích hoạt qua workflow `.github/workflows/pages.yml`).
