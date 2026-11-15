package hus.oop.lab.lab11.abstractfactorypattern.pseudocode;

public class WinCheckbox implements Checkbox {
    @Override
    public void paint() {
        System.out.println("Render a checkbox in Windows style");
    }
}
