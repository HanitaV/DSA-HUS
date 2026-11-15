package hus.oop.lab.lab11.factorypattern.examplepizza;

public class PepperoniPizza extends Pizza {
    @Override
    public void addIngredients() {
        System.out.println("Preparing ingredients for pepperoni pizza");
    }
}
