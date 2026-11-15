package hus.oop.lab.lab11.factorypattern.examplepizza;

public class PizzaFactory extends BasePizzaFactory {
    @Override
    public Pizza createPizza(String type) {
        Pizza pizza;

        switch (type) {
            case "cheese":
                pizza = new CheesePizza();
                break;
            case "veggie":
                pizza = new VeggiePizza();
                break;
            case "pepperoni":
                pizza = new PepperoniPizza();
                break;
            default:
                throw new IllegalArgumentException("No such pizza");
        }

        pizza.addIngredients();
        pizza.bakePiza();

        return pizza;
    }
}
