package hus.oop.integration;

import java.util.Random;

public class TestIntegrationCalculator {
    private MyPolynomial polynomial;

    public TestIntegrationCalculator(MyPolynomial polynomial) {
        this.polynomial = polynomial;
    }

    public static void main(String[] args) {
        /* TODO
         - Thực hiện các yêu cầu trong từng hàm test.
         - Lưu kết quả chạy chương trình vào file text có tên <TenSinhVien_MaSinhVien_Integration>.txt
           (ví dụ, NguyenVanA_123456_Integration.txt)
         - Nộp file kết quả chạy chương trình (file text trên) cùng với các file source code.
         */
        testArrayPolynomial();
        System.out.println();
        testListPolynomial();
        System.out.println();

    }

    public static void testArrayPolynomial() {
        /* TODO
         - Sinh ngẫu nhiên một số nguyên, lưu vào biến size. Sinh ngẫu nhiên size số thực. Tạo đa thức kiểu MyArrayPolynomial
           với các hệ số là các số thực vừa sinh ra, lưu vào biến polynomial.
         - Viết chương trình test các chức năng đa thức (thêm phần tử vào đa thức, xóa phần tử trong đa thức,
           sửa hệ số tại một phần tử, cộng 2 đa thức, trừ 2 đa thức, nhân 2 đa thức, tính giá trị của đa thức khi biết
           giá trị của x).
         - Tính tích phân xác định của đa thức được tạo ban đầu với các cận tích phân là 1.0 và 5.0.
         */
        System.out.println("testArrayPolynomial:");
        MyArrayPolynomial polynomial1 = creatMyArrayPolynomial();
        MyArrayPolynomial polynomial2 = creatMyArrayPolynomial();
        System.out.println("polynomial 1: " + polynomial1);
        System.out.println("polynomial 2: " + polynomial2);

        System.out.println("Adding value = 3 at index = 0 in poly1");
        polynomial1.add(3, 0);
        // System.out.println("After add: ");
        System.out.println("After add, polynomial1: " + polynomial1);

        // Không có phương thức xoá.
        // System.out.println("Removing coff at index 0");
        // polynomial1.

        System.out.println("Setting value = 1 at index = 0 in poly1");
        polynomial1.set(1, 0);
        System.out.println("After set, polynomial1: " + polynomial1);

        System.out.println("add: " + polynomial1.plus(polynomial2));
        System.out.println("minus: " + polynomial1.minus(polynomial2));
        System.out.println("times: " + polynomial1.multiply(polynomial2));
        System.out.println("polynomial with x = 2: " + polynomial1.evaluate(2));

    }
    private static MyArrayPolynomial creatMyArrayPolynomial() {
        Random random = new Random();
        int degree = random.nextInt(10) + 1;
        MyArrayPolynomial polynomial = new MyArrayPolynomial();
        for (int i = 0; i <= degree; i++) {
            polynomial.append(random.nextInt(10) + 1);
        }
        return polynomial;
    }


    public static void testListPolynomial() {
        /* TODO
         - Sinh ngẫu nhiên một số nguyên, lưu vào biến size. Sinh ngẫu nhiên size số thực. Tạo đa thức kiểu MyListPolynomial
           với các hệ số là các số thực vừa sinh ra, lưu vào biến polynomial.
         - Viết chương trình test các chức năng đa thức (thêm phần tử vào đa thức, xóa phần tử trong đa thức,
           sửa hệ số tại một phần tử, cộng 2 đa thức, trừ 2 đa thức, nhân 2 đa thức, tính giá trị của đa thức khi biết
           giá trị của x).
         - Tính tích phân xác định của đa thức được tạo ban đầu với các cận tích phân là 2.0 và 6.0.
         */
        System.out.println("testListPolynomial:");
        MyListPolynomial polynomial1 = creatMyListPolynomial();
        MyListPolynomial polynomial2 = creatMyListPolynomial();
        System.out.println("polynomial 1: " + polynomial1);
        System.out.println("polynomial 2: " + polynomial2);

        System.out.println("Adding value = 3 at index = 0 in poly1");
        polynomial1.add(3, 0);
        // System.out.println("After add: ");
        System.out.println("After add, polynomial1: " + polynomial1);

        // Không có phương thức xoá.
        // System.out.println("Removing coff at index 0");
        // polynomial1.

        System.out.println("Setting value = 1 at index = 0 in poly1");
        polynomial1.set(1, 0);
        System.out.println("After set, polynomial1: " + polynomial1);

        System.out.println("plus: " + polynomial1.plus(polynomial2));
        System.out.println("minus: " + polynomial1.minus(polynomial2));
        System.out.println("multiply: " + polynomial1.multiply(polynomial2));
        System.out.println("polynomial with x = 2: " + polynomial1.evaluate(2));

        System.out.print("Test Integration polynomial 1 with 2.0 and 6.0:  ");
        MyListPolynomial deri = polynomial1.derivative();
        System.out.println(deri.evaluate(6.0) - deri.evaluate(2.0));
    }
    private static MyListPolynomial creatMyListPolynomial() {
        Random random = new Random();
        int degree = random.nextInt(10) + 1;
        MyListPolynomial polynomial = new MyListPolynomial();
        for (int i = 0; i <= degree; i++) {
            polynomial.append(random.nextInt(10) + 1);
        }
        return polynomial;
    }
}
