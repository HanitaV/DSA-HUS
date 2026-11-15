package hus.oop.statistics;

import java.util.Arrays;

public class Statistics {
    private MyList data;

    /**
     * Khởi tạo dữ liệu cho BasicStatistic.
     */
    public Statistics(MyList data) {
        this.data = data;
    }

    /**
     * Lấy giá trị lớn nhất trong list.
     * @return giá trị lớn nhất.
     */
    public double max() {
        if (data.size() == 0) {
            throw new IllegalStateException("Cannot calculate max on an empty dataset.");
        }
        double res = data.get(0);
        for (int i = 0; i < data.size(); i++) {
            double value = data.get(i);
            if (value > res) {
                res = value;
            }
        }
        return res;
    }

    /**
     * Lấy giá trị nhỏ nhất trong list.
     * @return giá trị nhỏ nhất.
     */
    public double min() {
        if (data.size() == 0) {
            throw new IllegalStateException("Cannot calculate min on an empty dataset.");
        }
        double res = ((Double) data.get(0)).doubleValue();
        for (int i = 0; i < data.size(); i++) {
            double value = data.get(i);
            if (value < res) {
                res = value;
            }
        }
        return res;
    }

    /**
     * Tính kỳ vọng của mẫu theo dữ liệu trong list.
     * @return kỳ vọng.
     */
    public double mean() {
        if (data.size() == 0) {
            throw new IllegalStateException("Cannot calculate mean on an empty dataset.");
        }
        double sum = 0;
        for (int i = 0; i < data.size(); i++) {
            sum += data.get(i);
        }
        return sum / data.size();
    }

    /**
     * Tính phương sai của mẫu theo dữ liệu trong list.
     * @return phương sai.
     */
    public double variance() {
        if (data.size() == 0) {
            throw new IllegalStateException("Cannot calculate variance on an empty dataset.");
        }
        double result = 0;
        double mean = mean();
        for (int i = 0; i < data.size(); i++) {
            result += Math.pow(data.get(i) - mean, 2);
        }
        return result / data.size();
    }

    /**
     * Tìm kiếm trong list có phẩn tử nào có giá trị bằng data không, sử dụng binarySearch trong list.
     * Trả về index một phần tử có giá trị bằng data, nếu không tìm thấy thì trả về -1.
     * @return
     */
    public int search(double data) {
        return this.data.binarySearch(data);
    }

    /**
     * Tính rank của các phần tử trong list.
     * @return rank của các phần tử trong list
     */
    public double[] rank() {
        double[] res = new double[this.data.size()];
        for (int i = 0; i < res.length; i++) {
            res[i] = data.get(i);
        }
        Arrays.sort(res);
        int start = 0;
        int end = 0;
        for (int i = 1; i < this.data.size(); i++) {
            if (this.data.get(i) != this.data.get(i - 1)) {
                
                setArray(calRankAvg(start, end), res, start, end);
                start = i;
            }
            end = i;
        }
        setArray(calRankAvg(start, end), res, start, end);
        return res;
    }
    private static double calRankAvg(int start, int end) {
        double val = 0;
        for (int j = start; j <= end; j++) {
            val += j;
        }
        val = val / Double.valueOf(end - start + 1);
        return val;
    }
    private static void setArray(double value, double[] arr, int start, int end) {
        for (int i = start; i < end + 1; i++) {
            arr[i] = value;
        }
    }
}
