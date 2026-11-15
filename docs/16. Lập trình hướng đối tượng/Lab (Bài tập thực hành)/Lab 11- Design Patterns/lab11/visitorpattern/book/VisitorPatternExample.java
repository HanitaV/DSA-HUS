package hus.oop.lab.lab11.visitorpattern.book;

public class VisitorPatternExample {
    public static void main(String[] args) {
        Visitor visitor = new VisitorImpl();

        BusinessBook businessBook = new BusinessBook();
        DesignPatternBook designPatternBook = new DesignPatternBook();
        JavaCoreBook javaCoreBook = new JavaCoreBook();

        businessBook.accept(visitor);
        designPatternBook.accept(visitor);
        javaCoreBook.accept(visitor);
    }
}