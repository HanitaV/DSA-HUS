package hus.oop.lab.lab11.factorypattern.examplepizza;

public class VeggiePizza extends Pizza {
    @Override
    public void addIngredients() {
        System.out.println("Preparing ingredients for veggie veggies");
    }
}
