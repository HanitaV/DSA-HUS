## Nội dung chính

Mỗi nút lưu dữ liệu và tham chiếu tới nút kế tiếp. head xác định đầu danh sách; tail giúp truy cập nút cuối khi bản cài duy trì nó.

Chèn ở đầu chỉ cập nhật vài tham chiếu. Tìm nút theo vị trí vẫn cần duyệt từ đầu, nên không có truy xuất ngẫu nhiên O(1) như mảng.

## Tự kiểm tra

Có tail thì xóa nút cuối danh sách liên kết đơn luôn O(1) không?

## Gợi ý đối chiếu

Không. Vẫn cần tìm nút đứng trước để cập nhật liên kết, trừ khi đã có sẵn tham chiếu ấy.

## Đọc cùng tài liệu

Bài học được biên soạn từ: L3b- List ADT.pdf, trang 17-28. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
