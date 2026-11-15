package hus.oop.lab.lab11.visitorpattern.book;

public class DesignPatternBook extends ProgramingBook {
    public void accept(Visitor v) {
        v.visit(this);
    }

    public String getResource() {
        return "Design Patterns Resource";
    }

    public String getBestSeller() {
        return "Design Patterns Best Seller";
    }
}