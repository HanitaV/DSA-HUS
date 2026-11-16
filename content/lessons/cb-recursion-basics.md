## Vì sao cần

Nhiều bài toán có cấu trúc tự lặp lại theo kích thước nhỏ hơn: tính giai thừa $n!$, dãy Fibonacci, đổi số sang nhị phân hay tìm ước chung lớn nhất Euclid. Đệ quy giúp mô tả lời giải sát với định nghĩa toán học.

## Ý tưởng

**Đệ quy** (recursion) là cơ chế một phương thức tự gọi lại chính nó (xem thêm [[recursion]]). Một hàm đệ quy đúng cần hai phần:

1. **Bước cơ sở (suy biến)**: điều kiện dừng trả về kết quả trực tiếp không gọi đệ quy nữa.
2. **Bước đệ quy**: quy bài toán về bài toán cùng dạng với tham số nhỏ hơn, tiến dần về bước cơ sở.

**So sánh với vòng lặp**:
- Gần như mọi bài toán giải bằng đệ quy đều có thể viết lại bằng vòng lặp.
- Đệ quy thường ngắn gọn, dễ thiết lập với cấu trúc phân nhánh; nhưng vòng lặp hiệu quả hơn về tốc độ và bộ nhớ (tránh chi phí nhiều khung gọi hàm trên ngăn xếp và tránh tính lặp lại như Fibonacci ngây thơ).

## Cài đặt

```java
public class RecursionBasics {
    public static long fact(int n) {
        if (n <= 1) return 1;
        return n * fact(n - 1);
    }

    public static String toBinary(int n) {
        if (n <= 1) return String.valueOf(n);
        return toBinary(n / 2) + String.valueOf(n % 2);
    }

    public static int gcd(int p, int q) {
        if (q == 0) return p;
        return gcd(q, p % q);
    }
}
```

## Lỗi thường gặp

- Quên bước cơ sở (ví dụ `return harmonic(n - 1) + 1.0 / n;` không có `if (n == 1)`), gây tràn ngăn xếp `StackOverflowError`.
- Tham số không hội tụ về bước cơ sở (như gọi lại `harmonic(n)` thay vì `harmonic(n - 1)`).
- Dùng đệ quy trực tiếp cho Fibonacci với $n$ lớn làm lặp lại phép tính nhiều lần.

## Tự kiểm tra

1. Lần theo vết gọi hàm `gcd(1440, 408)` sẽ đi qua các cặp tham số nào trước khi trả về `24`?

::: Đáp án
`gcd(1440, 408)` $\to$ `gcd(408, 216)` $\to$ `gcd(216, 192)` $\to$ `gcd(192, 24)` $\to$ `gcd(24, 0)` $\to$ trả về `24`.
:::
