package hus.oop.lab.lab11.visitorpattern.pseudocode;

public class Dot implements Shape {
    int id, x, y;

    Dot(int id, int x, int y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    @Override
    public void move(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public void draw() {
        System.out.println("Dot " + id + " at " + x + ", " + y);
    }

    @Override
    public void accept(Visitor v) {
        v.visitDot(this);
    }
}

