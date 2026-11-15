package hus.oop.statistics;

import java.util.Arrays;
import java.util.NoSuchElementException;

public class MyArrayList extends MyAbstractList {
    private static final int DEFAULT_CAPACITY = 16;
    private double[] data;
    private int size;

    /**
     * Khởi tạo dữ liệu mặc định.
     */
    public MyArrayList() {
        size = 0;
        data = new double[DEFAULT_CAPACITY];
    }

    public double get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index out of bounds: " + index);
        }
        return data[index];
    }

    @Override
    public int size() {
        return this.size;
    }

    @Override
    public void add(double data) {
        if (size == this.data.length) {
            allocateMore();;
        }
        this.data[size++] = data;
    }

    @Override
    public void insert(double data, int index) {
        if (index < 0 || index > size) {
            throw new IndexOutOfBoundsException("Index out of bounds: " + index);
        }
        if (size == this.data.length) {
            allocateMore();;
        }
        for (int i = size; i > index; i--) {
            this.data[i] = this.data[i - 1];
        }
        this.data[index] = data;
        size++;
    }

    @Override
    public void remove(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index out of bounds: " + index);
        }
        for (int i = index; i < size - 1; i++) {
            data[i] = data[i + 1];
        }
        data[size - 1] = 0.0; // Clear the last element
        size--;
    }

    @Override
    public MyArrayList sortIncreasing() {
        double[] temp = new double[size];
        System.arraycopy(data, 0, temp, 0, size);
        Arrays.sort(temp);
        MyArrayList result = new MyArrayList();
        for (int i = 0; i < temp.length; i++) {
            result.add(temp[i]);
        }
        return result;
    }

    @Override
    public int binarySearch(double data) {
        int low = 0, high = size - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;

            // Check if x is present at mid
            if (this.data[mid] == data)
                return mid;

            // If x greater, ignore left half
            if (this.data[mid] < data)
                low = mid + 1;

            // If x is smaller, ignore right half
            else
                high = mid - 1;
        }

        // If we reach here, then element was
        // not present
        return -1;
    }

    /**
     * Tạo iterator để có thể duyệt qua các phần tử của list.
     * @return
     */
    @Override
    public MyIterator iterator(int start) {
        return new MyArrayListIterator(0);
    }

    /**
     * Cấp phát gấp đôi chỗ cho danh sách khi cần thiết.
     */
    private void allocateMore() {
        double[] newData = new double[data.length * 2];
        System.arraycopy(data, 0, newData, 0, data.length);
        data = newData;
    }

    private class MyArrayListIterator implements MyIterator {
        /**
         * Vị trí hiện tại của iterator trong MyArrayList.
         */
        private int currentPosition;

        /**
         * Khởi tạo dữ liệu cho iterator tại vị trí position của list.
         */
        public MyArrayListIterator(int position) {
            this.currentPosition = position;
        }

        @Override
        public boolean hasNext() {
            return currentPosition < size;
        }

        @Override
        public double next() {
            if (!hasNext()) throw new NoSuchElementException("No more elements");
            return data[currentPosition++];
        }

        @Override
        public void remove() {
            if (currentPosition <= 0 || currentPosition > size) {
                throw new IllegalStateException("Invalid position to remove");
            }
            MyArrayList.this.remove(--currentPosition);
        }
    }
}
