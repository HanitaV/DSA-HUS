## Nội dung chính

Phân tích cây quyết định: mỗi phép so sánh tạo một nhánh, còn thuật toán phải phân biệt các hoán vị đầu vào với khóa phân biệt.

Với n! khả năng, chiều cao cây phải ít nhất log₂(n!), dẫn đến cận dưới Ω(n log n) trong trường hợp xấu nhất.

Cận này chỉ áp dụng khi thuật toán dựa trên so sánh; không được dùng để bác bỏ các thuật toán có giả thiết đặc biệt về khóa.

## Tự kiểm tra

Vì sao một thuật toán chạy O(n log n) có thể gọi là tối ưu trong mô hình này?

## Gợi ý đối chiếu

Vì cận trên của nó khớp bậc với cận dưới cho mọi thuật toán sắp xếp dựa trên so sánh.

## Đọc cùng tài liệu

Bài học được biên soạn từ: 1. Michael T. Goodrich, Roberto Tamassia, Michael H. Goldwasser - Data Structures and Algorithms in Java-Wiley (2014).pdf, trang 574-575. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
