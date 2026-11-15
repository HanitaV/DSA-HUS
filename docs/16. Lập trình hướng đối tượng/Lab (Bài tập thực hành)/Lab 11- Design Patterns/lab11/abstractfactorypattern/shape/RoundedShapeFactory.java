package hus.oop.lab.lab11.abstractfactorypattern.shape;

public class RoundedShapeFactory implements AbstractFactory {
    @Override
    public Shape getShape() {
        return new RoundedRectangle();
    }
}
