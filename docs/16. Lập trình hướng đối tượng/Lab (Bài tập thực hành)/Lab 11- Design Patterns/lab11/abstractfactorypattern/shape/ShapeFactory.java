package hus.oop.lab.lab11.abstractfactorypattern.shape;

public class ShapeFactory implements AbstractFactory {
    @Override
    public Shape getShape() {
        return new Rectangle();
    }
}
