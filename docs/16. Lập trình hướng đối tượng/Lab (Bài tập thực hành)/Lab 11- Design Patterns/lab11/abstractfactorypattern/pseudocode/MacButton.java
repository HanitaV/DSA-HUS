package hus.oop.lab.lab11.abstractfactorypattern.pseudocode;

public class MacButton implements Button {
    @Override
    public void paint() {
        System.out.println("Render a button in macOS style");
    }
}