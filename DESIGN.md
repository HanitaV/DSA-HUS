# Lý do thiết kế

Loại sản phẩm: phần mềm học tập, giao diện sử dụng trực tiếp.

## Đồ thị là không gian học

Trang đầu mở thẳng vào đồ thị. Bố cục ba cột giữ danh sách, đồ thị và chi tiết trong cùng ngữ cảnh: chọn một mảnh là thấy ngay cần biết gì và có thể dùng ở đâu. Không đặt trang quảng bá hoặc yêu cầu đăng nhập trước hoạt động học.

Trong Khám phá, bố trí lực xác định tạo các vị trí tự do, không phụ thuộc thứ tự khóa học. Khi chọn mảnh, các hàng xóm trực tiếp được bố trí quanh nó để các kết nối dễ đọc; những mảnh khác vẫn có thể tìm qua danh sách, phóng toàn bộ hoặc kéo nền. Mảnh ban đầu được chọn theo dữ liệu: một mảnh mức 1 có nhiều ứng dụng. Không gắn cứng mã môn hoặc mã mảnh vào module đồ thị.

Theo khóa học dùng các hàng chia theo chương và giữ các cạnh tiên quyết. Lộ trình văn bản bên dưới là biểu diễn đầy đủ, có thứ tự và dễ dùng bằng bàn phím. Chọn liên kết vị trí khóa giữ cả mã khóa lẫn mã mảnh trong URL, làm nổi mảnh và chương tương ứng.

Mũi tên hướng từ kiến thức nền tới kiến thức sử dụng nó. Nét liền là tiên quyết, nét đứt là áp dụng, nét chấm là liên quan. Màu không phải tín hiệu duy nhất: loại quan hệ còn có chú giải và các danh sách riêng trong bảng chi tiết.

## Hệ thống thị giác

Chọn bảng cool-grey-cobalt từ skill thiết kế: nền xám lạnh `#eef0f3`, bề mặt trắng, chữ gần đen `#0b0c0e`, xanh `#1f2de6` cho thao tác và kết nối đang chọn. Nền trung tính giúp đọc lâu và phân biệt đường nối mà không cần nhiều màu. Màu xanh lá đi kèm chữ/trạng thái đã học; một chấm xanh riêng không được dùng thay nhãn trạng thái.

Instrument Sans được lưu tại chỗ, có system-ui dự phòng. Font đơn cách dùng cho mã và các chỉ số phụ. Góc bo 8–12 px, đường viền nhẹ và một kiểu nút chính giữ các vùng chức năng dễ phân biệt. Không dùng ảnh trang trí: chính đồ thị và tài liệu là nội dung cần nhìn.

Skill gợi ý hero giữa trang, hiệu ứng shader và một hoạt cảnh bộ đếm. Yêu cầu đồ thị làm điều hướng chính được ưu tiên: đây là không gian học, không phải landing page. Không thêm hero chiếm màn hình, shader hoặc bộ đếm chuyển động vào thao tác học. Chỉ có chuyển động vào nhẹ một lần ở tiêu đề và phản hồi hover/press; `prefers-reduced-motion` tắt toàn bộ chuyển động này. Các khác biệt với bộ kiểm tra landing page được ghi trong VALIDATION.md.

## Mobile và bàn phím

Dưới 760 px, thanh chế độ có hàng riêng, danh sách được mở bằng nút 44 px và chi tiết nằm sau đồ thị. Vùng vẽ cho phép kéo bằng một ngón tay; nút cộng/trừ và vừa khung hoạt động cả bằng cảm ứng lẫn bàn phím. Vùng nhận chạm của nút đồ thị được tính lại để tối thiểu 44 px dù tỷ lệ SVG thay đổi.

Danh sách và ô tìm kiếm cho phép đến mọi mảnh mà không cần thao tác trên đồ thị. Phím `/` mở và đặt tiêu điểm vào tìm kiếm; Escape đóng danh sách mobile. Tab/Enter/Space thao tác với các nút SVG; đường viền focus rõ. Liên kết bỏ qua nội dung không ghi đè URL của mảnh đang học.

## Tiến độ và đề xuất

Một tập ID đã học được lưu dưới khóa `hus.learned.v1` của localStorage, dùng chung cho mọi khóa trên cùng origin. Mảnh sẵn sàng khi tất cả cạnh tiên quyết đi vào nó đều đã học. Cạnh áp dụng hoặc liên quan không chặn học. Có thể tự đánh dấu một mảnh đã học dù còn tiên quyết, vì người học có thể đã biết kiến thức ấy từ trước.

Đề xuất là mảnh chưa học đầu tiên theo thứ tự chương, đã đủ tiên quyết. Bỏ đánh dấu một tiên quyết làm các mảnh phụ thuộc trở lại trạng thái chưa sẵn sàng. Phần trăm khóa chỉ đếm những mảnh thuộc khóa đó. Khi trình duyệt chặn hoặc hết dung lượng lưu, tiến độ trong lần mở vẫn dùng được và có thông báo cụ thể.

## Tĩnh và tách dữ liệu

HTML/CSS/ES modules tải JSON và Markdown qua đường dẫn tương đối, không router phía máy chủ. Hash URL chia sẻ được trên GitHub Pages mà không cần luật chuyển hướng. Module `graph.js` chỉ biết mảnh, cạnh và chương; logic tìm kiếm, tiến độ, đề xuất được tách vào `model.mjs`.

KaTeX 0.19.1 cùng font được vendoring, không gọi mạng bên thứ ba khi học. Trình Markdown chỉ hỗ trợ tập cú pháp phục vụ bài học và luôn escape HTML; không thực thi HTML từ dữ liệu. Các nguồn mở trong tab mới tại trang PDF được dẫn.

## Bài học

Mỗi bài có nội dung ngắn, một câu tự kiểm tra, gợi ý đối chiếu và nguồn cụ thể. Bảng kết nối được tạo từ dữ liệu để không bị lệch khi đổi quan hệ. Khối `#algorithm-animation[data-piece]` dành sẵn cho hoạt ảnh trong tương lai; hiện hiển thị rõ rằng hoạt ảnh chưa được bổ sung.
