## Nội dung chính

Lưu chỉ số đầu f và số phần tử sz trong mảng dung lượng N. Phần tử thêm mới đi vào vị trí $(f+sz)\bmod N$ nếu hàng đợi chưa đầy.

Sau dequeue, tăng f theo modulo N và giảm sz. Sau enqueue thành công, tăng sz. Phép modulo cho phép dùng lại vùng trống ở đầu mảng.

Phân biệt rỗng bằng sz=0 và đầy bằng sz=N, tránh dùng cùng một cặp chỉ số không kèm quy ước rõ ràng.

## Tự kiểm tra

Với N=5, f=4, sz=2, vị trí thêm mới là đâu?

## Gợi ý đối chiếu

$(4+2)\bmod5=1$. Các phần tử hiện tại nằm ở chỉ số 4 và 0.

## Đọc cùng tài liệu

Bài học được biên soạn từ: L4b- Queue ADT.pdf, trang 15-22. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
