package hus.oop.lab.lab11.visitorpattern.pseudocode;

public interface Shape {
    void move(int x, int y);
    void draw();
    void accept(Visitor v);
}
