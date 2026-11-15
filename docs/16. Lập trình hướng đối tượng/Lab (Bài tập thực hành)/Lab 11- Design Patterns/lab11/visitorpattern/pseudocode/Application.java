package hus.oop.lab.lab11.visitorpattern.pseudocode;

public class Application {
    private Shape[] allShapes;

    public Application() {
        allShapes = new Shape[]{
                new Dot(1, 10, 20),
                new Circle(2, 15, 25, 5),
                new Rectangle(3, 30, 40, 10, 20),
                new CompoundShape(4, new Dot(5, 50, 60), new Circle(6, 70, 80, 10))
        };
    }

    public void export() {
        Visitor exportVisitor = new XMLExportVisitor();
        for (Shape shape : allShapes) {
            shape.accept(exportVisitor);
        }
    }

    public static void main(String[] args) {
        Application app = new Application();
        app.export();
    }
}