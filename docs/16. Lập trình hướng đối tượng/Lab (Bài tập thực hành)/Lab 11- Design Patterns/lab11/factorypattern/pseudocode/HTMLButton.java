package hus.oop.lab.lab11.factorypattern.pseudocode;

public class HTMLButton implements Button {
    @Override
    public void render() {
        System.out.println("HTML button");
    }

    @Override
    public void onClick() {
        System.out.println("HTML button clicked");
    }
}
