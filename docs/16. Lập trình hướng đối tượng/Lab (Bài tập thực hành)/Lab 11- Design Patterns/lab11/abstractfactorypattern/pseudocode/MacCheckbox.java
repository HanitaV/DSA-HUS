package hus.oop.lab.lab11.abstractfactorypattern.pseudocode;

public class MacCheckbox implements Checkbox {
    @Override
    public void paint() {
        System.out.println("Render a checkbox in macOS style");
    }
}
