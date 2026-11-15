package hus.fp.rle;

public class RunlengthEncoding {
    public static void main(String[] args) {
        /*
        TODO:
        - Sinh một số nguyên ngẫu nhiên trong đoạn [30, 50], lưu giá trị vào biến length.
        - Hoàn thiện các hàm bên dưới để sinh ngẫu một xâu ký tự. Thực hiện mã hóa run-length xâu ký tự được sinh ra và giải mã kiểm tra lại.
        In ra màn hình theo định dạng:
        Generated String: xxxxx 

        Decoded Text: xxxxx
        Encoded Text: xxxxx

        Encoded Text: xxxxx
        Decoded Text: xxxxx
        */
    }

    /*
     * Hàm sinh ngẫu nhiên một xâu ký tự có độ dài length.
     * Sinh ra length số nguyên nằm trong khoảng [97, 122], chuyển những số nguyên này sang 
       ký tự chữ cái thường để có một xâu ký tự (String) được sinh ngẫy nhiên.
     */
    public static String randomLowerCaseString(int length) {
        /* TODO */
    }

    /*
     * Hàm mã hóa chuỗi ký tự text theo mã hóa run-length.
     */
    public static String encoding(String text) {
        /* TODO */
    }

    /*
     * Hàm giải mã chuỗi ký tự text theo mã hóa run-length.
     */
    public static String decoding(String text) {
        /* TODO */
    }

    /*
     * Hàm test mã hóa theo mã hóa run-length.
     */
    public static void testEncoding() {
        /* TODO */
    }

    /*
     * Hàm test giải mã theo mã hóa run-length.
     */
    public static void testDecoding() {
        /* TODO */
    }
}
