## Vì sao cần

Trong quá trình thiết kế phần mềm hướng đối tượng, nhiều bài toán kiến trúc lặp đi lặp lại: làm sao tạo đối tượng linh hoạt không phụ thuộc lớp cụ thể, làm sao mở rộng hành vi lúc chạy, hay làm sao giảm phụ thuộc giữa các thành phần. **Mẫu thiết kế (Design Patterns)** đúc kết các giải pháp đã được kiểm chứng cho những bài toán lặp lại đó, giúp đội ngũ phát triển dùng chung một vốn từ vựng kỹ thuật.

## Ý tưởng

Năm 1995, nhóm "Gang of Four" (GoF: Gamma, Helm, Johnson, Vlissides) hệ thống hóa **23 mẫu thiết kế** kinh điển, chia làm 3 nhóm:

1. **Nhóm Khởi tạo (Creational)**: tách rời quá trình tạo đối tượng khỏi cách hệ thống sử dụng chúng (ví dụ [[oop-singleton-pattern]], [[oop-factory-method-abstract-factory]]).
2. **Nhóm Cấu trúc (Structural)**: tổ chức cách ghép nối lớp và đối tượng thành cấu trúc lớn hơn mà vẫn linh hoạt (ví dụ [[oop-adapter-facade]], [[oop-decorator-pattern]], [[oop-bridge-proxy]]).
3. **Nhóm Hành vi (Behavioral)**: phân chia trách nhiệm và luồng giao tiếp thuật toán giữa các đối tượng (ví dụ [[oop-strategy-pattern]], [[oop-observer-pattern]], [[oop-template-method-iterator]], [[oop-command-state]]).

Mẫu thiết kế không phải đoạn mã chép-dán cố định, mà là **bản thiết kế tái sử dụng kinh nghiệm** bám sát nguyên lý [[oop-solid-principles]].

## Cài đặt

Cách chọn mẫu thiết kế theo vấn đề gặp phải:
- Cần đảm bảo chỉ có **1 thể hiện duy nhất** $\rightarrow$ Singleton.
- Cần đổi **thuật toán/hành vi** linh hoạt lúc chạy $\rightarrow$ Strategy.
- Cần **bọc thêm tính năng** cho đối tượng mà không bùng nổ lớp con $\rightarrow$ Decorator.
- Cần **thông báo tự động** khi trạng thái một đối tượng thay đổi $\rightarrow$ Observer.

## Lỗi thường gặp

- Cố ép dùng thật nhiều mẫu thiết kế vào bài toán đơn giản (*over-engineering*), làm mã nguồn phức tạp không cần thiết.
- Nhầm lẫn giữa cấu trúc giống nhau (ví dụ Adapter, Decorator và Proxy đều bọc đối tượng khác) mà quên xem **mục đích (intent)** của từng mẫu.

## Tự kiểm tra

1. Ba nhóm phân loại mẫu thiết kế kinh điển của GoF là gì, và mỗi nhóm giải quyết khía cạnh nào?

::: Đáp án
Gồm **Creational** (khởi tạo đối tượng), **Structural** (tổ hợp cấu trúc lớp/đối tượng) và **Behavioral** (tương tác và phân chia trách nhiệm hành vi giữa các đối tượng).
:::
