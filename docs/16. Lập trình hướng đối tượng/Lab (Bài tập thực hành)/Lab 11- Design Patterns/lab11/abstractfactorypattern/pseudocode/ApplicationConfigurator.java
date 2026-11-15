package hus.oop.lab.lab11.abstractfactorypattern.pseudocode;

public class ApplicationConfigurator {
    public static void main(String[] args) {
        String config = "Mac";
        GUIFactory factory;

        if (config == "Windows") {
            factory = new WinFactory();
        } else if (config == "Mac") {
            factory = new MacFactory();
        } else {
            throw new RuntimeException("Error! Unknown operating system");
        }

        Appliaction app = new Appliaction(factory);
        app.createUI();
        app.paint();
    }
}
