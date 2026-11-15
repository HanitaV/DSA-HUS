package hus.oop.lab.lab11.abstractfactorypattern.pseudocode;

public class WinButton implements Button {
    @Override
    public void paint() {
        System.out.println("Render a button in Windows style");
    }
}
