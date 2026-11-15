package hus.oop.lab.lab11.visitorpattern.book;

public class JavaCoreBook extends ProgramingBook {
    public void accept(Visitor v) {
        v.visit(this);
    }

    public String getResource() {
        return "Java Core Resource";
    }

    public String getFavouriteBook() {
        return "Effective Java";
    }
}