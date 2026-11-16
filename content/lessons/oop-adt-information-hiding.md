## Vì sao cần

Khi biểu diễn một khái niệm như Số phức (Complex) hay Danh sách (List), người dùng chỉ cần biết **làm được gì** (cộng, nhân, lấy phần thực/ảo) chứ không cần biết bên trong lưu theo tọa độ Descartes $(a, b)$ hay tọa độ cực $(r, \theta)$. Nếu để lộ cấu trúc lưu trữ, mọi mã khách hàng sẽ hỏng khi ta đổi cách cài đặt bên trong.

## Ý tưởng

- **Che giấu thông tin (Information Hiding)**: dựng "bức tường" quanh lớp để ẩn chi tiết cài đặt, chỉ cho phép giao tiếp qua giao diện công khai ([[java-interface-abstract]]).
- **Kiểu dữ liệu trừu tượng (ADT — Abstract Data Type)**: là tập dữ liệu đi kèm **đặc tả các phép toán** trên dữ liệu đó, tách biệt hoàn toàn khỏi **cấu trúc dữ liệu** cài đặt bên dưới.
- **Tiền điều kiện và Hậu điều kiện (Pre- & Post-conditions)**:
  - *Tiền điều kiện*: điều kiện phải đúng trước khi gọi phương thức (trách nhiệm của người gọi).
  - *Hậu điều kiện*: điều kiện đảm bảo đúng sau khi phương thức kết thúc nếu tiền điều kiện thỏa mãn (trách nhiệm của người cài đặt).

## Cài đặt

```java
public interface Complex {
    double realPart();
    double imagPart();
    Complex add(Complex other);
}

public class CartesianComplex implements Complex {
    private final double real;
    private final double imag;

    public CartesianComplex(double real, double imag) {
        this.real = real;
        this.imag = imag;
    }

    @Override public double realPart() { return real; }
    @Override public double imagPart() { return imag; }

    @Override
    public Complex add(Complex other) {
        return new CartesianComplex(real + other.realPart(), imag + other.imagPart());
    }
}
```

Đoạn mã khách hàng chỉ làm việc với kiểu `Complex`, nên có thể thay `CartesianComplex` bằng `PolarComplex` mà không phải sửa logic tính toán.

## Lỗi thường gặp

- Khai báo biến tham chiếu bằng lớp cụ thể (`CartesianComplex a = ...`) thay vì giao diện (`Complex a = ...`), làm mất khả năng thay đổi cài đặt linh hoạt.
- Cho phương thức trả về trực tiếp mảng/đối tượng nội bộ có thể thay đổi (mutable), vô tình phá vỡ "bức tường" che giấu thông tin.

## Tự kiểm tra

1. Phân biệt ngắn gọn giữa **Cấu trúc dữ liệu (Data Structure)** và **Kiểu dữ liệu trừu tượng (ADT)**.

::: Đáp án
**ADT** chỉ đặc tả dữ liệu và các phép toán *làm được gì* (mặt giao diện). **Cấu trúc dữ liệu** là cách tổ chức bộ nhớ cụ thể (mảng, danh sách liên kết, ...) để *cài đặt* các phép toán đó.
:::
