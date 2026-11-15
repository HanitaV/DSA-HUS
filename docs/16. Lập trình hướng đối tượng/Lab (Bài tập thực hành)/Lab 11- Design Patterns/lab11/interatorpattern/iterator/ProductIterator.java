package hus.oop.lab.lab11.interatorpattern.iterator;

public class ProductIterator implements Iterator {
    private String[] items;
    private int index = 0;

    public ProductIterator(String[] items) {
        this.items = items;
    }

    @Override
    public boolean hasNext() {
        if (index >= items.length || items[index] == null) {
            return false;
        }

        return true;
    }

    @Override
    public String next() {
        return items[index++];
    }
}
