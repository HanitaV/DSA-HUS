package hus.oop.lab.lab11.factorypattern.examplepizza;

public class CheesePizza extends Pizza {
    @Override
    public void addIngredients() {
        System.out.println("Preparing ingredients for cheese pizza");
    }
}
