## Vì sao cần

Chương trình thực tế luôn gặp tình huống bất thường: tệp không tồn tại, chia cho 0, truy cập ngoài biên mảng hoặc mất kết nối mạng. Nếu chỉ trả về mã lỗi kiểu `-1`, người gọi rất dễ quên kiểm tra và để lỗi lan truyền âm thầm. Cơ chế **Ngoại lệ (Exception)** tách riêng luồng xử lý lỗi khỏi luồng nghiệp vụ chính.

## Ý tưởng

Mọi ngoại lệ và lỗi trong Java đều kế thừa từ `java.lang.Throwable`, chia làm hai nhánh:
- **`Error`**: lỗi nghiêm trọng của JVM (ví dụ `OutOfMemoryError`, `StackOverflowError`), chương trình thường không thể tự phục hồi.
- **`Exception`**: các tình huống bất thường mà ứng dụng có thể xử lý, chia thành:
  1. **Checked Exception** (các lớp con của `Exception` *không* kế thừa `RuntimeException`, ví dụ `IOException`, `FileNotFoundException`): trình biên dịch **bắt buộc** phải xử lý bằng `try-catch` hoặc khai báo `throws`.
  2. **Unchecked Exception** (các lớp con của `RuntimeException`, ví dụ `NullPointerException`, `ArithmeticException`, `IndexOutOfBoundsException`): thường do lỗi lập trình, trình biên dịch **không bắt buộc** bắt.

**Cơ chế lan truyền trên Call Stack**: khi ngoại lệ được ném ra tại một phương thức, JVM tìm ngược lên ngăn xếp lời gọi hàm (`call stack`) cho tới khi gặp khối `catch` phù hợp; nếu lên tới `main()` vẫn không ai bắt, chương trình dừng và in stack trace.

## Cài đặt

```java
import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class CheckedVsUnchecked {
    // Checked exception: bắt buộc khai báo throws hoặc try-catch
    public static void readFile(String path) throws FileNotFoundException {
        Scanner sc = new Scanner(new File(path));
        sc.close();
    }
}
```

## Lỗi thường gặp

- Nhầm lẫn rằng mọi `Exception` đều bị trình biên dịch bắt xử lý: chỉ **Checked Exception** mới bị kiểm tra lúc biên dịch, còn `RuntimeException` và `Error` là unchecked.
- Dùng ngoại lệ để điều khiển luồng rẽ nhánh thông thường (như thay cho `if`) gây giảm hiệu năng và rối mã nguồn.

## Tự kiểm tra

1. `NullPointerException` và `FileNotFoundException` thuộc nhóm Checked hay Unchecked Exception? Vì sao?

::: Đáp án
`NullPointerException` là **Unchecked Exception** (kế thừa `RuntimeException`). `FileNotFoundException` là **Checked Exception** (kế thừa `IOException` $ightarrow$ `Exception`, không qua `RuntimeException`), nên trình biên dịch ép phải xử lý hoặc khai báo `throws`.
:::
