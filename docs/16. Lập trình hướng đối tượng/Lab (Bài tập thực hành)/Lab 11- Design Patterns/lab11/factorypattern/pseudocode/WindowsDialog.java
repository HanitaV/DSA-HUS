package hus.oop.lab.lab11.factorypattern.pseudocode;

public class WindowsDialog extends Dialog{
    @Override
    public Button createButton() {
        return new WindowsButton();
    }
}

