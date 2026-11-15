package hus.oop.lab.lab11.factorypattern.pseudocode;

// Lớp Application
public class Application {
    private Dialog dialog;

    public void initialize() {
        String config = readApplicationConfigFile();
        if (config.equals("Windows")) {
            dialog = new WindowsDialog();
        } else if (config.equals("Web")) {
            dialog = new WebDialog();
        } else {
            throw new RuntimeException("Error! Unknown operating system.");
        }
    }

    public void main() {
        this.initialize();
        dialog.render();
    }

    private String readApplicationConfigFile() {
        return "Windows";
    }

    public static void main(String[] args) {
        Application app = new Application();
        app.main();
    }
}

