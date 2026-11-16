# Nội dung cần rà soát

## Phạm vi đã thực hiện

Đã đọc tệp và trích xuất tự động toàn bộ 604 tệp trong `docs/`: 137 PDF, 9 PPTX, 4 DOCX, mã Java, văn bản, dữ liệu và các gói nén. Tổng số trang PDF/slide là 13.232. Danh mục từng tệp, số trang, môn, thư mục chương và tình trạng trích xuất nằm trong [DOCUMENTS.md](DOCUMENTS.md) và `data/documents.json`.

**Không coi bước trích xuất là đã thẩm định thủ công cả 13.232 trang.** Nội dung website hiện biên soạn 176 mảnh ngắn cho 4 khóa (`THCS4`, `OOP`, `MAT3514`, `MAT3504`) dựa trên các nguồn được ghi trong từng mảnh, chưa chuyển toàn bộ chương trong mọi sách tham khảo thành bài học. Các nguồn là slide có hình hoặc sách scan vẫn cần xem trực quan để kiểm chứng đầy đủ. Không ghi nhận phần đó là đã hoàn tất chỉ vì script đọc tệp thành công.

Đã kiểm tra sự tồn tại và giới hạn trang của các nguồn đang dẫn, đọc các đoạn nguồn được trích cho các mảnh và đối chiếu những công thức, điều kiện hoặc quy ước gây nhầm. Các bài hiện là bài đọc ngắn để định hướng học; sơ đồ, mã dài và đề bài đầy đủ vẫn cần mở PDF. Câu hỏi tự kiểm tra được biên soạn từ nội dung tương ứng, không phải bản chép nguyên đề thi.

## Quy ước trang và lỗi trích xuất

- Mọi số trang là vị trí trong PDF, bắt đầu từ 1. Với sách Goodrich, trang PDF 574–575 tương ứng trang in 556–557. Với `L7 - DynamicPrograming.pdf`, một số số in trên slide không khớp vị trí trang. Bấm nguồn dùng vị trí PDF.
- `thiet_ke_va_danh_gia_thuat_toan_9853.pdf` trích xuất ra mã tiếng Việt cũ như “Thieát keá”. Đây là lỗi mã hóa văn bản trong PDF, không phải định nghĩa mới. Các mảnh DFS, BFS, Dijkstra, Floyd và LCS đã được diễn đạt lại; cần xem PDF khi đối chiếu ký hiệu chi tiết.
- `4. Cau truc dư lieu va giai thuat - Do Xuan Loi.pdf` có 305 trang rất ít hoặc không có chữ trích xuất được, có khả năng là bản scan. Chưa dùng các trang ấy làm cơ sở bổ sung bài học; cần OCR/đọc hình nếu muốn khai thác nguồn này.
- Nhiều slide sắp xếp, cây, đồ thị và OOP có trang chủ yếu là hình. `emptyPages` trong `data/documents.json` liệt kê toàn bộ trang có dưới 40 ký tự; đây là tín hiệu cần xem lại, không khẳng định trang trắng hay lỗi OCR.
- DOCX không có phân trang ổn định qua parser nên danh mục để trống số trang. Các tệp ZIP mới được lập mục lục và đọc mã/văn bản bên trong; tài liệu nhị phân lồng trong ZIP chưa được chuyển thành nguồn bài học độc lập. `.class`, `.rescache`, `.DS_Store` được ghi nhận là nhị phân, không diễn giải thành nội dung học.

## Định nghĩa và điều kiện cần chú ý

1. **Cây đầy đủ và chiều cao.** `L5- Tree.pdf`, trang 17–19 dùng “Full Binary Tree” theo hình dạng đầy ở các mức và công thức $2^h-1$, với ví dụ gốc ở mức 1. Thuật ngữ “full” ở sách khác có thể chỉ mỗi nút trong có hai con, chưa đủ suy ra công thức đó. Phần heap ở `L6- Priority Queue and Heap.pdf`, trang 12 đếm chiều cao theo cạnh, gốc ở độ sâu 0. Các bài giữ rõ hai quy ước thay vì ghép chúng.
2. **Giao diện Java.** `L1- Java Review.pdf`, trang 18–22 trình bày giao diện theo tập phương thức trừu tượng của ví dụ. Không mở rộng thành khẳng định về mọi tính năng của các phiên bản Java. Tóm tắt cũ “giao diện chỉ chứa đầu phương thức public abstract” đã được thu hẹp để tránh tổng quát hóa.
3. **Danh sách mảng và stack.** `L3b- List ADT.pdf`, trang 14 nói về chi phí dịch chuyển; chèn cuối O(1) giả định còn chỗ. Đã bổ sung nguồn Goodrich trang PDF 282–283 về mở rộng mảng. Tóm tắt không còn khẳng định mọi lần append đều O(1). Stack dùng mảng cũng cần xét riêng lúc mở rộng.
4. **Định lý chính.** `Homework2_Recursion.pdf`, trang 2 cho bảng ba trường hợp dạng $aT(n/b)+n^d$ với giả thiết rõ. Không dùng bảng giản lược này thay cho mọi truy hồi $aT(n/b)+f(n)$; bản tổng quát trong slide có điều kiện riêng.
5. **Xáo trộn đều.** `L2- Sorting.pdf`, trang 28–29 mô tả ngắn cách đổi chỗ ngẫu nhiên. Phạm vi chỉ số chọn ngẫu nhiên phải được xác định trước khi khẳng định phân bố đều. Bài chưa thêm một bản cài cụ thể có xuất xứ ngoài nguồn.
6. **Vét cạn.** Cách nói “luôn tìm được nghiệm” ở phần ưu điểm của slide cần điều kiện có nghiệm và phép duyệt đầy đủ trên không gian hữu hạn. Bài đã ghi rõ điều kiện.
7. **Nhánh cận.** `L5 - Trial and Error.pdf`, trang 40–44 dùng chi phí đường đã đi so với BestCost. Cắt nhánh bằng chi phí hiện tại chỉ an toàn khi phần còn lại không thể giảm tổng chi phí, chẳng hạn cạnh không âm. Không dùng nguyên mã ấy cho chi phí âm mà thiếu cận hợp lệ.
8. **Tham lam đổi tiền.** `L6 - Greedy.pdf`, trang 9 cho phương án 8 đồng tốt hơn phương án tham lam 10 đồng. Bài chỉ kết luận tham lam không tối ưu; không dùng việc tìm được 8 đồng như một chứng minh rằng không thể ít hơn 8.
9. **BFS và Dijkstra.** BFS tối ưu số cạnh trong đồ thị không trọng số; Dijkstra yêu cầu trọng số không âm. Các tóm tắt đã ghi rõ, tránh hiểu hai bài là thuật toán thay thế nhau trên mọi đồ thị.
10. **Quy hoạch động.** Slide so sánh với đệ quy có tính lại bài toán con; không phải mọi thuật toán chia để trị đều chồng lấp bài toán con. Tóm tắt cũ đã sửa. Bài chỉ theo phương pháp điền bảng của nguồn, chưa bổ sung một chương riêng về memoization.
11. **Tổ hợp và LIS.** `L7 - DynamicPrograming.pdf`, trang 10–13 dùng C(i,j) để chọn i từ j, khác cách viết C(n,k) thường gặp. Đã giải thích thứ tự đối số. Với LIS trang 26–28, khi không có phần tử trước nhỏ hơn thì L(i)=1; không lấy max trên tập rỗng.
12. **Balo 0–1.** Trang 29–32 dùng p cho trọng lượng, w cho giá trị. Phương án lấy vật chỉ hợp lệ khi p_i≤j. Đã bổ sung điều kiện vốn thiếu trong tóm tắt cũ.
13. **Đường đi bảng số.** `L7 - DynamicPrograming.pdf`, trang 36–37 có mã giả cần kiểm tra hàng m+1 ngoài bảng, thứ tự điền theo hàng dù phụ thuộc cột trước, và bước truy vết nhánh dưới. Bài giữ ý nghĩa trạng thái và công thức; chưa coi đoạn mã đó là chương trình đã kiểm chứng. Đích (m,n) được giữ theo đề trang 33.
14. **Khóa trùng trong BST.** `L7- Searching and Binary Search Tree.pdf`, trang 10 đặt câu hỏi xử lý khóa trùng. Bài thuộc tính giữ quy ước khóa phân biệt; khi cài phải chọn chính sách đếm, cập nhật hay đặt khóa trùng ở một phía và giữ nhất quán.
15. **Bộ nhớ phụ của sắp xếp.** Khi nói Quick Sort “tại chỗ”, cần làm rõ có tính ngăn xếp đệ quy hay không. Bài so sánh tính chất đã nhắc quy ước này; chưa đồng nhất mọi nguồn về cách đếm.

## Quan hệ tiên quyết do biên soạn

Các cạnh là quyết định sư phạm dựa trên thứ tự và việc sử dụng trong tài liệu, không phải tất cả đều là phát biểu tiên quyết của giảng viên. Validator chứng minh không có chu trình, không chứng minh mọi quyết định sư phạm đều đúng.

Đã chuyển bốn cạnh từ tiên quyết thành liên quan vì có thể học đích mà không bắt buộc bản cài ở nguồn:

- Stack → khử đệ quy: cần cho cách khử tổng quát bằng stack, nhưng không cho mọi dạng đệ quy đuôi.
- Tìm nhị phân → thuộc tính BST: là so sánh ý tưởng; có thể học trực tiếp thuộc tính BST.
- Danh sách liên kết → biểu diễn đồ thị: ma trận kề không cần danh sách liên kết.
- Queue → priority queue: hữu ích để đối chiếu thứ tự lấy ra, nhưng FIFO không phải tiên quyết bắt buộc.

Cần người dạy xem lại các cạnh còn có thể nới: sắp xếp → tìm nhị phân (cần hiểu điều kiện dữ liệu có thứ tự, không bắt buộc biết một thuật toán sắp xếp), đệ quy → DFS (bản lặp không cần gọi đệ quy), cây nhị phân biểu diễn → heap (có thể học heap từ mảng). Hiện giữ để lộ trình không bỏ qua nền tảng đang được dùng trong bài.

MAT3504 thêm chương nền tảng chung gồm ADT, danh sách, queue, bài toán sắp xếp và khái niệm cây để các tiên quyết không bị treo ngoài khóa. Đây là cách tổ chức website, không tự nhận là chương chính thức trong đề cương. Nguồn mục tiêu môn vẫn được giữ trong JSON của khóa.

## Hai mảnh trước đây đánh dấu ngoài docs

- **Cận dưới sắp xếp:** đã tìm thấy lập luận cây quyết định và cận Ω(n log n) trong sách Goodrich thuộc `docs/`, trang PDF 574–575. Thay nguồn trước đó chỉ dẫn slide ghi “optimal”.
- **LCS:** đã xác nhận giáo trình `thiet_ke_va_danh_gia_thuat_toan_9853.pdf`, trang 111–115 chứa phát biểu, bảng và truy vết. Mở rộng khoảng trang để bao gồm mã và bỏ nhãn ngoài docs.

Hiện không còn mảnh đánh dấu `source: ngoài docs`. Điều đó phản ánh nguồn đang dẫn đã nằm trong repository, không thay thế việc người dạy thẩm định mọi câu diễn giải.

## Phần để làm sau

- Hoạt ảnh thuật toán hiện chỉ có vùng gắn kết với mã mảnh, chưa có mô phỏng tương tác.
- Bài học còn ngắn; cần mở rộng lời giải bài tập, ví dụ nhiều bước và phần chứng minh theo từng nguồn.
- OCR sách scan và kiểm tra trực quan toàn bộ slide hình.
- Chưa triển khai lên tài khoản GitHub; workflow đã chuẩn bị để chủ repository kích hoạt.
