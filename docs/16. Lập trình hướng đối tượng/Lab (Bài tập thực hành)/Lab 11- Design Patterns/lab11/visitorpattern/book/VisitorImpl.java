package hus.oop.lab.lab11.visitorpattern.book;

public class VisitorImpl implements Visitor {
    public void visit(BusinessBook book) {
        System.out.println("Visiting Business Book");
        System.out.println("Publisher: " + book.getPublisher());
    }

    public void visit(DesignPatternBook book) {
        System.out.println("Visiting Design Pattern Book");
        System.out.println("Resource: " + book.getResource());
        System.out.println("Best Seller: " + book.getBestSeller());
    }

    public void visit(JavaCoreBook book) {
        System.out.println("Visiting Java Core Book");
        System.out.println("Resource: " + book.getResource());
        System.out.println("Favourite Book: " + book.getFavouriteBook());
    }
}