package hus.oop.lab.lab11.visitorpattern.pseudocode;

public class Circle implements Shape {
    int id, x, y, radius;

    Circle(int id, int x, int y, int radius) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    @Override
    public void move(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public void draw() {
        System.out.println("Circle " + id + " at " + x + ", " + y);
    }

    @Override
    public void accept(Visitor v) {
        v.visitCircle(this);
    }
}