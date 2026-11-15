## Nội dung chính

Tìm kiếm đi trái hoặc phải theo so sánh với khóa nút hiện tại. Chèn tìm vị trí rỗng tương ứng. findMin đi theo các liên kết trái tới nút cuối.

Xóa có ba trường hợp: nút lá, nút một con, nút hai con. Với hai con, slide thay bằng khóa nhỏ nhất trong cây con phải rồi xóa nút thay thế ở vị trí cũ.

Mỗi thao tác đi theo một số đường có độ dài bị chặn bởi chiều cao h. Không thể tự đổi O(h) thành O(log n) nếu chưa có điều kiện cân bằng.

## Tự kiểm tra

Nếu BST suy biến thành một đường, tìm khóa cuối có chi phí thế nào?

## Gợi ý đối chiếu

Có thể qua n nút, nên trường hợp xấu là O(n).

## Đọc cùng tài liệu

Bài học được biên soạn từ: L7- Searching and Binary Search Tree.pdf, trang 15-26. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
