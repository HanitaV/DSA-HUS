## Nội dung chính

Đưa đỉnh bắt đầu vào hàng đợi và đánh dấu. Lần lượt lấy đầu hàng đợi, xét các đỉnh kề chưa thăm, đánh dấu và đưa chúng vào cuối.

FIFO làm các đỉnh được xét theo từng lớp số cạnh tính từ đỉnh bắt đầu. Lưu cha khi phát hiện đỉnh mới để truy ngược đường đi.

Kết luận đường ngắn nhất ở đây nói về số cạnh của đồ thị không trọng số hoặc mọi cạnh có cùng chi phí. Không thay thế Dijkstra trên trọng số tùy ý.

## Tự kiểm tra

Nên đánh dấu khi đưa vào hàng đợi hay chờ tới lúc lấy ra?

## Gợi ý đối chiếu

Đánh dấu ngay khi đưa vào để tránh nhiều đỉnh cha cùng đưa một đỉnh vào hàng đợi.

## Đọc cùng tài liệu

Bài học được biên soạn từ: thiet_ke_va_danh_gia_thuat_toan_9853.pdf, trang 64-66; Hw8_Graph.pdf, trang 2; Đề cương ôn tập cuối kỳ_Thiết kế và đánh giá thuật toán.pdf, trang 1. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
