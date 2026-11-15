package hus.oop.lab.lab11.interatorpattern.iterator;

public class InteratorPatternExample {
    public static void main(String[] args) {
        ProductCatalog productCatalog = new ProductCatalog();
        Iterator productIterator = productCatalog.getIterator();
        while (productIterator.hasNext()) {
            System.out.println(productIterator.next());
        }
    }
}
