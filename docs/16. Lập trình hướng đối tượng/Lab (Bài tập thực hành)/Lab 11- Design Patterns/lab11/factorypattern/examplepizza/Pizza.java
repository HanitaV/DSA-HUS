package hus.oop.lab.lab11.factorypattern.examplepizza;

public abstract class Pizza {
    public abstract void addIngredients();

    public void bakePiza() {
        System.out.println("Pizza baked a t 400 f o r 20 minutes.");
    }
}
