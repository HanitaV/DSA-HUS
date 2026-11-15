package hus.oop.lab.lab11.visitorpattern.pseudocode;

public class Rectangle implements Shape {
    int id, x, y, width, height;

    Rectangle(int id, int x, int y, int width, int height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    @Override
    public void move(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public void draw() {
        System.out.println("Rectangle " + id + " at " + x + ", " + y);
    }

    @Override
    public void accept(Visitor v) {
        v.visitRectangle(this);
    }
}