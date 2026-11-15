package hus.oop.lab.lab11.interatorpattern.iterator;

public class ProductCatalog implements Iterable {
    private String[] productCatalog;

    public ProductCatalog() {
        productCatalog = new String[]{"Item1", "Item2", "Item3", "Item4", "Item5"};;
    }

    @Override
    public Iterator getIterator() {
        return new ProductIterator(productCatalog);
    }
}
