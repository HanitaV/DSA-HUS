package hus.oop.lab.lab11.abstractfactorypattern.pseudocode;

public class Appliaction {
    private GUIFactory factory;
    private Button button;

    public Appliaction(GUIFactory factory) {
        this.factory = factory;
    }

    public void createUI() {
        this.button = factory.createButton();
    }

    public void paint() {
        button.paint();
    }
}
