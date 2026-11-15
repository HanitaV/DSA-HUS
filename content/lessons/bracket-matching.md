## Nội dung chính

Gặp ngoặc mở thì đẩy loại ngoặc vào stack. Gặp ngoặc đóng, stack phải không rỗng và đỉnh phải là ngoặc mở cùng loại.

Sau khi khớp một cặp, pop ngoặc mở tương ứng. Cuối chuỗi, stack phải rỗng; chỉ đếm số ngoặc mở và đóng là chưa đủ.

Với chuỗi ([)], số lượng từng loại ngoặc cân bằng nhưng stack phát hiện sai ngay khi gặp dấu ) vì đỉnh đang là [.

## Tự kiểm tra

Vì sao chuỗi (() bị từ chối dù không gặp ngoặc đóng sai loại?

## Gợi ý đối chiếu

Cuối chuỗi vẫn còn một ngoặc mở trong stack, nên còn cặp chưa được đóng.

## Đọc cùng tài liệu

Bài học được biên soạn từ: L4a- Stack ADT.pdf, trang 24-25; Hw4_Stack and Queue.pdf, trang 3; Hw4_Stack and Queue.pdf, trang 5. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
