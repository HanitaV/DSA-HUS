## Nội dung chính

Chia dãy thành hai nửa, sắp từng nửa rồi trộn bằng cách so sánh hai phần tử đầu chưa lấy. Dãy độ dài không quá một là cơ sở.

Trong bước trộn, lấy phần tử nhỏ hơn rồi tăng con trỏ của nửa đó; khi một nửa hết, sao chép phần còn lại của nửa kia.

Các slide đưa ví dụ trộn 1, 5, 9 với 2, 11 thành 1, 2, 5, 9, 11. Bản dùng mảng tạm cần bộ nhớ phụ tuyến tính.

## Tự kiểm tra

Trộn hai dãy đã sắp có tổng n phần tử cần chi phí bậc nào?

## Gợi ý đối chiếu

O(n), vì mỗi phần tử được đưa vào kết quả một lần. Kết hợp với hai lời gọi n/2 cho O(n log n).

## Đọc cùng tài liệu

Bài học được biên soạn từ: L2- Sorting.pdf, trang 39-49. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
