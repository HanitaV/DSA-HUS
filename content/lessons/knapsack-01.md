## Nội dung chính

Theo slide, p_i là trọng lượng và w_i là giá trị; mỗi vật được lấy tối đa một lần. C(i,j) là giá trị tốt nhất khi xét i vật đầu và sức chứa j.

Không lấy vật i cho C(i−1,j). Chỉ khi p_i≤j mới xét phương án lấy nó: C(i−1,j−p_i)+w_i. Nếu quá nặng thì chỉ giữ phương án không lấy.

Cơ sở C(0,j)=C(i,0)=0 trong mô hình của slide. Truy vết từ C(n,W): so với hàng trước để quyết định có lấy vật i hay không.

## Tự kiểm tra

Vì sao dùng hàng i−1 cho cả hai phương án?

## Gợi ý đối chiếu

Để vật i không được dùng lại; truy hồi cùng hàng có thể biến thành một bài cho phép chọn lặp.

## Đọc cùng tài liệu

Bài học được biên soạn từ: L7 - DynamicPrograming.pdf, trang 29-32. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
