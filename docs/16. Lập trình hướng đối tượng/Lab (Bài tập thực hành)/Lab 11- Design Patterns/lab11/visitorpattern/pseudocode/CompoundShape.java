package hus.oop.lab.lab11.visitorpattern.pseudocode;

public class CompoundShape implements Shape {
    int id;
    Shape[] children;

    CompoundShape(int id, Shape... components) {
        this.id = id;
        this.children = components;
    }

    @Override
    public void move(int x, int y) {
        for (int i = 0; i < children.length; i++) {
            children[i].move(x, y);
        }
    }

    @Override
    public void draw() {
        for (int i = 0; i < children.length; i++) {
            children[i].draw();
        }
    }

    @Override
    public void accept(Visitor v) {
        v.visitCompoundShape(this);
    }
}