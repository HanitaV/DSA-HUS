package hus.oop.lab.lab11.observerpattern.observerdemo;

public abstract class Observer {
    protected Subject subject;
    public abstract void update();
}
