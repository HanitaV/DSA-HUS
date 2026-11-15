package hus.fp.polynomial;

/*
 * Tạo một đa thức với các hệ số được lưu trong biến coefficents. Hệ số tự do bắt đầu từ chỉ số 0.
 */
public class MyArrayPolynomial {
    private static final int DEFAULT_CAPACITY = 8;
    private double[] coefficients;
    private int length;

    /*
     * Khởi tạo dữ liệu mặc định.
     */
    public MyArrayPolynomial() {
        /* TODO */
    }

    /*
     * Hàm trả về hệ số của đa thức ở vị trí index.
     */
    public double coefficient(int index) {
        /* TODO */
    }

    /*
     * Hàm trả về các hệ số của đa thức.
     */
    public double[] coefficients() {
        /* TODO */
    }

    /*
     * Hàm thêm vào một giá trị ở cuối mảng coefficients để nhận được một đa thức có bậc lớn hơn.
     */
    public void append(double coefficient) {
        /* TODO */
    }

    /*
     * Hàm thêm vào một giá trị ở vị trí index của mảng coefficients để nhận được một đa thức có bậc lớn hơn.
     */
    public void insert(double coefficient, int index) {
        /* TODO */
    }

    /*
     * Hàm xóa giá trị ở vị trí index của mảng coefficients để nhận được một đa thức có bậc nhỏ hơn.
     */
    public void remove(int index) {
        /* TODO */
    }

    /*
     * Hàm thay đổi giá trị ở vị trí index của mảng coefficients để nhận được một đa thức khác.
     */
    public void set(double coefficient, int index) {
        /* TODO */
    }

    /*
     * Hàm trả về bậc của đa thức.
     */
    public int degree() {
        /* TODO */
    }

    /*
     * Hàm tính giá trị của đa thức khi biết giá trị của biến độc lập x.
     */
    public double evaluate(double x) {
        /* TODO */
    }

    /*
     * Hàm lấy đạo hàm của đa thức, trả về đa thức là đạo hàm của đa thức hiện tại.
     */
    public MyArrayPolynomial derivative() {
        /* TODO */
    }

    /*
     * Hàm cộng đa thức hiện tại với một đa thức khác, trả về đa thức là tổng của hai đa thức.
     */
    public MyArrayPolynomial plus(MyArrayPolynomial right) {
        /* TODO */
    }

    /*
     * Hàm trừ đa thức hiện tại cho một đa thức khác, trả về đa thức là hiệu của đa thức hiện tại trừ đi một đa thức khác đã cho.
     */
    public MyArrayPolynomial minus(MyArrayPolynomial right) {
        /* TODO */
    }

    /*
     * Hàm nhân đa thức hiện tại với một đa thức khác, trả về đa thức là tích của hai đa thức.
     */
    public MyArrayPolynomial multiply(MyArrayPolynomial right) {
        /* TODO */
    }

    /*
     * Hàm cho phép tăng kích thước mảng lên gấp đôi để lưu các hệ số của đa thức, nếu mảng ban đầu đã sử dụng hết.
     */
    private void allocateMore() {
        /* TODO */
    }

    /*
     * Hàm định dạng đa thức theo dạng: [a_nx^n + ... + a1x + a0]
     */
    public String toString() {
        /* TODO */
    }
}
