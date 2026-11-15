package hus.oop.lab.lab11.factorypattern.fruit;

public class CallingClass {
    public static void main(String[] args) {
        FruitFactory factory = new FruitFactory();
        Fruit apple = factory.provideFruit("Apple");
    }
}
