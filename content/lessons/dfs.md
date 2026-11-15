## Nội dung chính

Bắt đầu từ đỉnh s, đánh dấu đỉnh khi thăm và tiếp tục sang một đỉnh kề chưa thăm. Khi không còn hướng mới thì quay lại lời gọi trước.

Ngăn xếp lời gọi thể hiện đường đang đi sâu. Mảng đánh dấu tránh việc đi lặp qua chu trình; không bỏ đánh dấu khi chỉ đang duyệt các đỉnh có thể đến được.

Một lần DFS từ s chỉ thăm được các đỉnh có đường đi từ s. Muốn duyệt toàn đồ thị không liên thông, cần khởi động lại từ các đỉnh chưa thăm.

## Tự kiểm tra

Vì sao đánh dấu là cần thiết khi đồ thị có chu trình?

## Gợi ý đối chiếu

Nếu không, thuật toán có thể trở về một đỉnh đang hoặc đã xử lý rồi tiếp tục lặp mãi.

## Đọc cùng tài liệu

Bài học được biên soạn từ: thiet_ke_va_danh_gia_thuat_toan_9853.pdf, trang 62-64; Hw8_Graph.pdf, trang 2-3; Đề cương ôn tập cuối kỳ_Thiết kế và đánh giá thuật toán.pdf, trang 1. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
