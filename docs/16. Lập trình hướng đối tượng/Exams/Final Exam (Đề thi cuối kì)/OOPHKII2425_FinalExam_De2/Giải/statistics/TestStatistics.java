package hus.oop.statistics;

import java.util.Random;

public class TestStatistics {
    private Statistics statistics;

    public TestStatistics(Statistics statistics) {
        this.statistics = statistics;
    }

    public static void main(String[] args) {
        /* TODO
           - Thực hiện từng hàm test, lưu kết quả chạy chương trình và file text được đặt tên
             là <TenSinhVien_MaSinhVien_Statistics>.txt (Ví dụ, NguyenVanA_123456_Statistics.txt).
           - Nén các file source code và file text kết quả chạy chương trình vào file zip có tên
             <TenSinhVien_MaSinhVien_Statistics>.zip (Ví dụ, NguyenVanA_123456_Statistics.zip),
             nộp lên classroom.
         */
        TestStatistics test = new TestStatistics(null);
        test.testMyArrayList();
        test.testMyLinkedList();
    }

    public void testMyArrayList() {
        /* TODO
           - Sinh ngẫu nhiên một số tự nhiên nằm trong đoạn [30, 50], lưu vào biến length.
           - Tạo một list kiểu MyArrayList, có các phần tử dữ liệu kiểu double được sinh ngẫu nhiên
             nằm trong đoạn [1, 20]. Tạo Statistics có dữ liệu là list dữ liệu vừa tạo, lưu vào statistics.
           - Sử dụng Statistics để tính các đại lượng thống kê cơ bản (max, min, kỳ vọng, phương sai, rank, sắp xếp, tìm kiếm).
             In ra terminal tập dữ liệu, tập dữ liệu được sắp xếp, các đại lượng thống kê và kết quả chức năng tìm kiếm.
         */
        System.out.println("----Test MyArrayList----");
        MyList data = new MyArrayList();
        genData(data);
        this.statistics = new Statistics(data);
        System.out.println("Tập dữ liệu: " + data);
        System.out.println("Tập đã sắp xếp: " + data.sortIncreasing());
        System.out.println("Các đại lượng thống kê: ");
        printStatistics(data);
        System.out.println("kết quả chức năng tìm kiếm: " + data.binarySearch(2.0));



    }

    public void testMyLinkedList() {
        /* TODO
           - Sinh ngẫu nhiên một số tự nhiên nằm trong đoạn [30, 50], lưu vào biến length.
           - Tạo một list kiểu MyLinkedList, có các phần tử lưu dữ liệu kiểu double được sinh ngẫu nhiên
             nằm trong đoạn [1, 20]. Tạo Statistics có dữ liệu là list dữ liệu vừa tạo, lưu vào statistics.
           - Sử dụng Statistics để tính các đại lượng thống kê cơ bản (max, min, kỳ vọng, phương sai, rank, sắp xếp, tìm kiếm).
             In ra terminal tập dữ liệu, tập dữ liệu được sắp xếp, các đại lượng thống kê và kết quả chức năng tìm kiếm.
         */
        System.out.println("----Test MyLinkedList----");
        MyList data = new MyLinkedList();
        genData(data);
        this.statistics = new Statistics(data);
        System.out.println("Tập dữ liệu: " + data);
        System.out.println("Tập đã sắp xếp: " + data.sortIncreasing());
        System.out.println("Các đại lượng thống kê: ");
        printStatistics(data);
        System.out.println("kết quả chức năng tìm kiếm: " + data.binarySearch(2.0));
    }
    private static void genData(MyList dataSet) {
        Random random = new Random();
        int n = random.nextInt(21) + 30;
        double[] res = new double[n];
        for (int i = 0; i < n; i++) {
            res[i] = Math.round(random.nextDouble() * 10000.0) / 500.0;
        }
        for (int i = 0; i < res.length; i++) {
            dataSet.add(res[i]);
        }
    }

    private static void printStatistics(MyList dataSet) {
        Statistics basicStatistics = new Statistics(dataSet);

        // System.out.println("Data Set: " + dataSet.toString());
        System.out.println("Max: " + basicStatistics.max());
        System.out.println("Min: " + basicStatistics.min());
        System.out.println("Mean: " + basicStatistics.mean());
        System.out.println("Variance: " + basicStatistics.variance());
        double[] r = basicStatistics.rank();
        System.out.print("rank: ");
        for (int i = 0; i < r.length; i++) {
          System.out.print(r[i] + " ");
        }
        System.out.println();
        
    }
}
