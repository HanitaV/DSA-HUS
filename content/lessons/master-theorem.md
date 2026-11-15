## Nội dung chính

Dạng giản lược trong phiếu bài tập là $T(n)=aT(n/b)+n^d$, với $a\ge1$, $b>1$, $d\ge0$ và n là lũy thừa của b.

So sánh a với $b^d$: nhỏ hơn cho $O(n^d)$, bằng cho $O(n^d\log n)$, lớn hơn cho $O(n^{\log_b a})$.

Không áp dụng nguyên bảng này cho mọi hàm f(n). Các slide khác trình bày phiên bản tổng quát với những điều kiện riêng; hãy kiểm tra dạng truy hồi trước.

## Tự kiểm tra

Với T(n)=2T(n/2)+n, thuộc trường hợp nào?

## Gợi ý đối chiếu

$a=2$, $b=2$, $d=1$, nên $a=b^d$. Cận là $O(n\log n)$.

## Đọc cùng tài liệu

Bài học được biên soạn từ: Bai 3 - De qui  va khu de qui.pdf, trang 26-29; L3 - Recursion.pdf, trang 25-28; L4 - Divide and Conquer.pdf, trang 10; Homework2_Recursion.pdf, trang 2. Số trang được tính từ trang đầu của tệp PDF, bắt đầu bằng 1. Mở liên kết nguồn bên dưới để xem sơ đồ, bảng và mã đầy đủ.
