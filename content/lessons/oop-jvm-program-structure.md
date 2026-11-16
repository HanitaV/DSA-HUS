## Vì sao cần

Khi viết chương trình bằng C/C++, tệp thực thi biên dịch ra phụ thuộc trực tiếp vào hệ điều hành và phần cứng. Java giải quyết bài toán **"viết một lần, chạy mọi nơi"** (Compile Once, Run Anywhere) nhờ kiến trúc biên dịch hai bước qua bytecode và Máy ảo Java (JVM). Nắm vững cấu trúc một tệp nguồn Java (`package`, `import`, `class`, `main`) là bước đầu tiên để tổ chức mã nguồn sạch sẽ.

## Ý tưởng

Quá trình thực thi một chương trình Java gồm hai giai đoạn:

1. **Biên dịch (Compile-time)**: Trình biên dịch `javac` dịch mã nguồn `.java` thành mã trung gian **bytecode** lưu trong tệp `.class`.
2. **Thực thi (Run-time)**: Máy ảo Java (**JVM** — Java Virtual Machine) trên từng hệ điều hành sẽ đọc bytecode và thông dịch/biên dịch sang mã máy tương ứng.

Về bộ công cụ:
- **JVM**: máy ảo thực thi bytecode.
- **JRE** (Java Runtime Environment): gồm JVM và các thư viện chuẩn để chạy chương trình.
- **JDK** (Java Development Kit): gồm JRE cùng các công cụ phát triển như `javac`, trình gỡ lỗi.

## Cài đặt

Một tệp nguồn Java tiêu chuẩn có thứ tự: khai báo gói (`package`), nhập thư viện (`import`) và định nghĩa lớp (`class`):

```java
package hus.oop.intro;          // 1. Gói (tùy chọn, dòng đầu tiên)

import java.util.Scanner;       // 2. Nhập lớp từ gói khác (tùy chọn)

public class HelloWorld {       // 3. Tên lớp public trùng tên file HelloWorld.java
    public static void main(String[] args) {
        System.out.println("Xin chào OOP!");
    }
}
```

## Lỗi thường gặp

- Đặt tên lớp `public` khác với tên tệp `.java` (ví dụ `public class Main` trong tệp `Hello.java`): trình biên dịch `javac` sẽ báo lỗi ngay.
- Đặt `import` phía trên dòng `package`: sai thứ tự cú pháp; `package` luôn phải đứng đầu tệp (trừ chú thích).
- Quên từ khóa `static` trong `public static void main(String[] args)`: JVM không thể gọi điểm vào chương trình vì chưa có đối tượng nào được tạo.

## Tự kiểm tra

1. Tệp `.class` do `javac` sinh ra chứa mã máy của hệ điều hành hay chứa gì? Nếu gửi tệp `.class` sang máy khác có cài JVM, có chạy được không?

::: Đáp án
Tệp `.class` chứa **bytecode** (mã trung gian độc lập nền tảng), không phải mã máy riêng của hệ điều hành. Có thể chạy trực tiếp trên bất kỳ máy nào đã cài JVM/JRE tương thích.
:::
