package hus.oop.statistics;

import java.util.Arrays;
import java.util.NoSuchElementException;

public class MyLinkedList extends MyAbstractList {
    private MyNode top;
    private int size;

    /**
     * Khởi tạo dữ liệu mặc định.
     */
    public MyLinkedList() {
        this.top = null;
        this.size = 0;
    }

    @Override
    public int size() {
        return size;
    }
    public double get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index out of bounds: " + index);
        }
        return getNodeByIndex(index).data;
    }

    @Override
    public void add(double data) {
        MyNode newNode = new MyNode(data);
        if (top == null) {
            top = newNode;
        } else {
            MyNode current = top;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newNode;
        }
        size++;
    }

    @Override
    public void insert(double data, int index) {
        if (index < 0 || index > size) {
            throw new IndexOutOfBoundsException("Index out of bounds: " + index);
        }
        MyNode newNode = new MyNode(data);
        if (index == 0) {
            newNode.next = top;
            top = newNode;
        } else {
            MyNode prev = getNodeByIndex(index - 1);
            newNode.next = prev.next;
            prev.next = newNode;
        }
        size++;
    }

    @Override
    public void remove(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index out of bounds: " + index);
        }
        if (index == 0) {
            top = top.next;
        } else {
            MyNode prev = getNodeByIndex(index - 1);
            prev.next = prev.next.next;
        }
        size--;
    }

    @Override
    public MyLinkedList sortIncreasing() {
        double[] temp = new double[size];
        for (int i = 0; i < size; i++) {
            temp[i] = get(i);
        }
        Arrays.sort(temp);
        MyLinkedList result = new MyLinkedList();
        for (int i = 0; i < size; i++) {
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
            if (get(mid) == data)
                return mid;

            // If x greater, ignore left half
            if (get(mid) < data)
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
     * Tạo iterator để cho phép duyệt qua các phần tử của list.
     * @return
     */
    @Override
    public MyIterator iterator(int start) {
        return new MyLinkedListIterator(0);
    }

    /**
     * Lấy node ở vị trí index.
     * @param index
     * @return
     */
    private MyNode getNodeByIndex(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index out of bounds: " + index);
        }
        MyNode current = top;
        for (int i = 0; i < index; i++) {
            current = current.next;
        }
        return current;
    }

    private class MyLinkedListIterator implements MyIterator {
        /*
         * Vị trí hiện tại của iterator trong list.
         */
        private int currentPosition;

        /**
         * Khởi tạo cho iterator ở vị trí position trong MyLinkedList.
         * @param position
         */
        public MyLinkedListIterator(int position) {
            this.currentPosition = position;
        }

        @Override
        public boolean hasNext() {
            return currentPosition < size;
        }

        @Override
        public double next() {
            if (!hasNext()) {
                throw new NoSuchElementException("No more elements");
            }
            double payload = getNodeByIndex(currentPosition).data;
            currentPosition++;
            return payload;
        }

        @Override
        public void remove() {
            if (currentPosition <= 0 || currentPosition > size) {
                throw new IllegalStateException("Cannot remove element before calling next()");
            }
            MyLinkedList.this.remove(currentPosition - 1);
            currentPosition--;
        }
    }
}
