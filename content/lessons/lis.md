## Nội dung chính

L(i) là độ dài dãy con tăng kết thúc tại a_i. Khởi tạo L(i)=1; chỉ nối từ j<i có a_j<a_i, lấy giá trị tốt nhất L(j)+1.

Với ví dụ 2,5,4,6,3,8,9,7, bảng độ dài của slide là 1,2,2,3,2,4,5,4. Đáp án độ dài là giá trị lớn nhất trong bảng.

Truy vết từ một vị trí đạt max, lùi về j có a_j<a_i và L(j)=L(i)−1. Có thể có nhiều vị trí hợp lệ, dẫn tới nhiều nghiệm.

## Tự kiểm tra

Nếu không có j nào nhỏ hơn i với a_j<a_i thì L(i) bằng gì?

## Gợi ý đối chiếu

Bằng 1, tương ứng dãy chỉ gồm phần tử a_i. Không lấy max của một tập rỗng mà bỏ qua cơ sở.

## Đọc cùng tài liệu

Bài học được biên soạn từ: L7 - DynamicPrograming.pdf, trang 26-28. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
