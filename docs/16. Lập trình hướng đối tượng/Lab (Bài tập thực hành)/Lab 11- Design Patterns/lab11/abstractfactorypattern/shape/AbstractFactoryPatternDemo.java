package hus.oop.lab.lab11.abstractfactorypattern.shape;

public class AbstractFactoryPatternDemo {
    public static void main(String[] args) {
        String shapetype = "Shape";
        AbstractFactory factory;

        if (shapetype.equals("Shape")) {
            factory = new ShapeFactory();
        } else if (shapetype.equals("RoundedShape")) {
            factory = new RoundedShapeFactory();
        } else {
            throw new IllegalArgumentException("Unsupported shapetype: " + shapetype);
        }

        FactoryProducer producer = new FactoryProducer(factory);
        producer.getAbstractFactory().getShape().draw();
    }
}
