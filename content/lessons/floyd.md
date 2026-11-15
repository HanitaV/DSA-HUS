## Nội dung chính

Ở bước k, chỉ cho phép dùng các đỉnh 1…k làm đỉnh trung gian. Đường tốt nhất i→j hoặc không qua k, hoặc ghép i→k và k→j.

Công thức là $d^k_{ij}=\min(d^{k-1}_{ij},d^{k-1}_{ik}+d^{k-1}_{kj})$. Khởi tạo từ ma trận cạnh và khoảng cách từ mỗi đỉnh tới chính nó.

Thứ tự các pha k phải ở ngoài; pha mới mở rộng tập đỉnh trung gian được phép. Đọc giả thiết của nguồn về trọng số trước khi diễn giải khoảng cách.

## Tự kiểm tra

Vì sao k mang ý nghĩa khác i và j?

## Gợi ý đối chiếu

i,j là hai đầu đường đi, còn k xác định tập đỉnh trung gian được phép trong pha đang tính.

## Đọc cùng tài liệu

Bài học được biên soạn từ: thiet_ke_va_danh_gia_thuat_toan_9853.pdf, trang 100-103. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
