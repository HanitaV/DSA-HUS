## Nội dung chính

Stack chỉ thêm và lấy ở đỉnh theo LIFO. push thêm, pop lấy và bỏ, top đọc mà không bỏ phần tử đỉnh.

Bản mảng giữ vị trí đỉnh; bản liên kết có thể dùng đầu danh sách làm đỉnh. Các thao tác cơ bản không cần duyệt các phần tử còn lại.

Khi gọi pop hoặc top trên stack rỗng, bản cài phải xử lý theo hợp đồng, chẳng hạn báo lỗi hoặc trả giá trị quy định. Không được đọc ngoài vùng dữ liệu.

## Tự kiểm tra

Push A, push B, top, rồi pop: top và pop trả gì?

## Gợi ý đối chiếu

Cả hai đều trả B; top không thay đổi stack, còn pop bỏ B và để A ở đỉnh.

## Đọc cùng tài liệu

Bài học được biên soạn từ: L4a- Stack ADT.pdf, trang 6-21. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
