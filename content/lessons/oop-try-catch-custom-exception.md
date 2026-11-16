## Vì sao cần

Khi phát hiện ngoại lệ (xem [[oop-exceptions-hierarchy]]), ta cần cơ chế vừa bắt và xử lý an toàn, vừa đảm bảo tài nguyên (như tệp tin, kết nối) luôn được đóng lại kể cả khi có lỗi xảy ra. Ngoài ra, trong bài toán nghiệp vụ riêng, việc tự định nghĩa lớp ngoại lệ giúp thông báo lỗi rõ ngữ nghĩa hơn.

## Ý tưởng

- **`try-catch-finally`**:
  - `try`: chứa khối lệnh có khả năng ném ngoại lệ.
  - `catch`: bắt và xử lý loại ngoại lệ tương ứng (nếu có nhiều `catch`, lớp con phải đặt **trước** lớp cha).
  - `finally`: luôn chạy dù có ngoại lệ hay không (thường dùng dọn dẹp tài nguyên).
- **`try-with-resources`** (từ Java 7): tự động đóng tài nguyên cài đặt `AutoCloseable` (như `BufferedReader`, `Scanner`) mà không cần `finally` thủ công.
- **`throw` vs `throws`**: `throw` dùng trong thân hàm để **ném** một đối tượng ngoại lệ cụ thể; `throws` đặt ở chữ ký hàm để **khai báo** phương thức có thể ném ngoại lệ ra ngoài.
- **Custom Exception**: tạo lớp kế thừa `Exception` (nếu muốn checked) hoặc `RuntimeException` (nếu muốn unchecked).

## Cài đặt

```java
class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        super(message);
    }
}

public class ExceptionHandlingDemo {
    static void checkAge(int age) throws InvalidAgeException {
        if (age < 0) throw new InvalidAgeException("Tuổi không được âm: " + age);
    }

    public static void main(String[] args) {
        try {
            checkAge(-5);
        } catch (InvalidAgeException e) {
            System.err.println("Lỗi: " + e.getMessage());
        } finally {
            System.out.println("Hoàn tất kiểm tra.");
        }
    }
}
```

## Lỗi thường gặp

- Đặt `catch (Exception e)` lên **trước** `catch (IOException e)`: lỗi biên dịch vì nhánh con không bao giờ tới được (`unreachable catch block`).
- Viết khối `catch (Exception e) { }` rỗng ("nuốt" ngoại lệ), làm che giấu hoàn toàn lỗi khi gỡ rối.

## Tự kiểm tra

1. Nếu trong khối `try` có lệnh `return`, khối `finally` có được thực thi không?

::: Đáp án
**Có.** Khối `finally` luôn được thực thi trước khi phương thức thực sự trả về (trừ trường hợp JVM bị tắt đột ngột bằng `System.exit()`).
:::
