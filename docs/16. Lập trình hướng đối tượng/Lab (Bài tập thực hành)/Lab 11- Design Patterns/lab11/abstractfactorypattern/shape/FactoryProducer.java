package hus.oop.lab.lab11.abstractfactorypattern.shape;

public class FactoryProducer {
    AbstractFactory factory;

    public FactoryProducer(AbstractFactory factory) {
        this.factory = factory;
    }

    public AbstractFactory getAbstractFactory() {
        return factory;
    }
}
