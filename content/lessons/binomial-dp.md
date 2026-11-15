## Nội dung chính

Trong ký hiệu của slide, C(i,j) là số cách chọn i phần tử từ j phần tử, nên chỉ xét miền 0≤i≤j.

Chia thành hai trường hợp có hoặc không chọn phần tử cuối: $C(i,j)=C(i-1,j-1)+C(i,j-1)$; cơ sở $C(0,j)=C(i,i)=1$.

## Tự kiểm tra

C(1,3) bằng bao nhiêu theo truy hồi?

## Gợi ý đối chiếu

$C(0,2)+C(1,2)=1+2=3$. Chú ý thứ tự hai đối số của nguồn.

## Đọc cùng tài liệu

Bài học được biên soạn từ: L7 - DynamicPrograming.pdf, trang 10-13. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
