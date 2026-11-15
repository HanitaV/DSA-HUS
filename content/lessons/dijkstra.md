## Nội dung chính

Giữ nhãn tạm cho độ dài đường tốt nhất đang biết từ nguồn. Mỗi bước chốt đỉnh chưa xét có nhãn nhỏ nhất rồi cập nhật các đỉnh kề.

Phép cập nhật là $L(v)=\min(L(v),L(u)+w(u,v))$. Lưu đỉnh trước khi nhãn được cải thiện để dựng lại đường đi.

Điều kiện áp dụng là trọng số không âm. Đỉnh không thể tới được giữ nhãn vô cực; không chọn một chỉ số đỉnh chưa được gán khi mọi nhãn còn lại đều vô cực.

## Tự kiểm tra

Dijkstra và BFS khác nhau ở cách chọn đỉnh tiếp theo thế nào?

## Gợi ý đối chiếu

BFS theo thứ tự hàng đợi của số cạnh; Dijkstra chọn nhãn độ dài tạm nhỏ nhất theo trọng số.

## Đọc cùng tài liệu

Bài học được biên soạn từ: thiet_ke_va_danh_gia_thuat_toan_9853.pdf, trang 84-89; L6 - Greedy.pdf, trang 31; Hw8_Graph.pdf, trang 2; Đề cương ôn tập cuối kỳ_Thiết kế và đánh giá thuật toán.pdf, trang 1. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
