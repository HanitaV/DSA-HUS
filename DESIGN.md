# Lý do thiết kế

Loại sản phẩm: phần mềm học tập, giao diện sử dụng trực tiếp.

## Đồ thị là không gian học

Trang đầu mở thẳng vào đồ thị toàn cảnh. Bố cục gồm thanh bên có thể thu gọn ở bên trái, vùng đồ thị trung tâm chiếm tối đa chiều cao màn hình và bảng chi tiết bên phải chỉ mở khi người học chọn một mảnh kiến thức. Không đặt trang quảng bá hoặc yêu cầu đăng nhập trước hoạt động học.

Trong chế độ Khám phá, đồ thị bố trí các mảnh kiến thức cốt lõi (`137` khái niệm, định lý, công thức) thành các tầng DAG có hướng (mặc định Trái → phải, chuyển được sang Trên → dưới trong thanh `Bộ lọc`), sử dụng thẻ chữ nhật bo góc, đường cong Bezier mượt và bản đồ thu gọn ở góc phải dưới để kéo nhìn nhanh. Các `ví dụ` và `bài tập` (`39` mảnh) được ẩn khỏi đồ thị chính mặc định để giữ đồ thị thoáng, đồng thời liên kết trực tiếp trong mục `Ví dụ & bài tập liên quan` của bảng chi tiết hoặc bật lại bất cứ lúc nào qua `Bộ lọc`.

Theo khóa học hiển thị các thẻ chương (`Chương 1..n`) dẫn vào DAG tiên quyết từng chương và giữ lộ trình văn bản đầy đủ ở bên dưới để đọc tuần tự hoặc dùng bằng bàn phím. Chọn liên kết vị trí khóa giữ cả mã khóa lẫn mã mảnh trong URL, làm nổi mảnh và chương tương ứng.

Mũi tên hướng từ kiến thức nền tới kiến thức sử dụng nó. Mặc định chỉ vẽ cạnh `Tiên quyết` nét liền; cạnh `Áp dụng` nét đứt và `Liên quan` nét chấm bật/tắt độc lập trong `Bộ lọc`. Màu sắc luôn đi kèm chấm phân loại, nhãn chữ và biểu tượng trạng thái `Đã học`.

## Hệ thống thị giác

Chọn bảng cool-grey-cobalt từ skill thiết kế: nền xám lạnh `#eef0f3`, bề mặt trắng, chữ gần đen `#0b0c0e`, xanh `#1f2de6` cho thao tác và kết nối đang chọn. Nền trung tính giúp đọc lâu và phân biệt đường nối mà không cần nhiều màu. Màu xanh lá đi kèm chữ/trạng thái đã học; một chấm xanh riêng không được dùng thay nhãn trạng thái.

Instrument Sans được lưu tại chỗ, có system-ui dự phòng. Font đơn cách dùng cho mã và các chỉ số phụ. Góc bo 8–12 px, đường viền nhẹ và một kiểu nút chính giữ các vùng chức năng dễ phân biệt. Không dùng ảnh trang trí: chính đồ thị và tài liệu là nội dung cần nhìn.

Skill gợi ý hero giữa trang, hiệu ứng shader và một hoạt cảnh bộ đếm. Yêu cầu đồ thị làm điều hướng chính được ưu tiên: đây là không gian học, không phải landing page. Không thêm hero chiếm màn hình, shader hoặc bộ đếm chuyển động vào thao tác học. Chỉ có chuyển động vào nhẹ một lần ở tiêu đề và phản hồi hover/press; `prefers-reduced-motion` tắt toàn bộ chuyển động này. Các khác biệt với bộ kiểm tra landing page được ghi trong VALIDATION.md.

## Mobile và bàn phím

Dưới 760 px, thanh chế độ có hàng riêng, danh sách được mở bằng nút 44 px, bản đồ thu gọn được ẩn để giữ khung đồ thị rộng và bảng chi tiết nằm sau đồ thị. Vùng vẽ cho phép kéo bằng một ngón tay, cuộn để thu phóng quanh con trỏ; nút cộng/trừ và vừa khung hoạt động cả bằng cảm ứng lẫn bàn phím.

Danh sách và ô tìm kiếm cho phép đến mọi mảnh (bao gồm ví dụ và bài tập) mà không cần thao tác trên đồ thị. Phím `/` mở và đặt tiêu điểm vào tìm kiếm; `Escape` đóng thanh bên mobile, đóng bảng chi tiết đang mở hoặc đóng thanh bộ lọc. `Tab`/`Enter`/`Space` thao tác với các thẻ SVG; đường viền focus rõ. Liên kết bỏ qua nội dung không ghi đè URL của mảnh đang học.

## Tiến độ và đề xuất

Một tập ID đã học được lưu dưới khóa `hus.learned.v1` của localStorage, dùng chung cho mọi khóa trên cùng origin. Mảnh sẵn sàng khi tất cả cạnh tiên quyết đi vào nó đều đã học. Cạnh áp dụng hoặc liên quan không chặn học. Có thể tự đánh dấu một mảnh đã học dù còn tiên quyết, vì người học có thể đã biết kiến thức ấy từ trước.

Đề xuất là mảnh chưa học đầu tiên theo thứ tự chương, đã đủ tiên quyết. Bỏ đánh dấu một tiên quyết làm các mảnh phụ thuộc trở lại trạng thái chưa sẵn sàng. Phần trăm khóa chỉ đếm những mảnh thuộc khóa đó. Khi trình duyệt chặn hoặc hết dung lượng lưu, tiến độ trong lần mở vẫn dùng được và có thông báo cụ thể.

## Tĩnh và tách dữ liệu

HTML/CSS/ES modules tải JSON và Markdown qua đường dẫn tương đối, không router phía máy chủ. Hash URL chia sẻ được trên GitHub Pages mà không cần luật chuyển hướng. Module `graph.js` chỉ biết mảnh, cạnh và chương; logic tìm kiếm, tiến độ, đề xuất được tách vào `model.mjs`.

KaTeX 0.19.1 cùng font được vendoring, không gọi mạng bên thứ ba khi học. Trình Markdown chỉ hỗ trợ tập cú pháp phục vụ bài học và luôn escape HTML; không thực thi HTML từ dữ liệu. Các nguồn mở trong tab mới tại trang PDF được dẫn.

## Bài học

Mỗi bài có nội dung ngắn, một câu tự kiểm tra, gợi ý đối chiếu và nguồn cụ thể. Bảng kết nối được tạo từ dữ liệu để không bị lệch khi đổi quan hệ. Khối `#algorithm-animation[data-piece]` dành sẵn cho hoạt ảnh trong tương lai; hiện hiển thị rõ rằng hoạt ảnh chưa được bổ sung.
