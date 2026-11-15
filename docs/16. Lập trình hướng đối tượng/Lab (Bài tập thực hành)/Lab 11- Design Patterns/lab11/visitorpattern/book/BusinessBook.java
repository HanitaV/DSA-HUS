package hus.oop.lab.lab11.visitorpattern.book;

public class BusinessBook implements Book {
    public void accept(Visitor v) {
        v.visit(this);
    }

    public String getPublisher() {
        return "Business Publisher";
    }
}
