package hus.oop.lab.lab11.factorypattern.fruit;

public class FruitFactory {
    Fruit fruit;

    public Fruit provideFruit(String type) {
        switch (type) {
            case "Apple":
                fruit = new Apple();
                break;
            case "Banana":
                fruit = new Banana();
                break;
            case "Orange":
                fruit =  new Orange();
                break;
            default:
                throw new IllegalArgumentException("Invalid fruit type");
        }

        fruit.produceJuice();

        return fruit;
    }
}