package hus.oop.lab.lab11.visitorpattern.pseudocode;

public class XMLExportVisitor implements Visitor {
    @Override
    public void visitDot(Dot d) {
        // Export the dot’s ID and center coordinates.
        System.out.println("Exporting Dot: ID = " + d.id + ", coordinates = (" + d.x + ", " + d.y + ")");
    }

    @Override
    public void visitCircle(Circle c) {
        // Export the circle’s ID, center coordinates and radius.
        System.out.println("Exporting Circle: ID = " + c.id + ", center = (" + c.x + ", " + c.y + "), radius = " + c.radius);
    }

    @Override
    public void visitRectangle(Rectangle r) {
        // Export the rectangle’s ID, left-top coordinates, width, and height.
        System.out.println("Exporting Rectangle: ID = " + r.id + ", top-left = (" + r.x + ", " + r.y + "), width = " + r.width + ", height = " + r.height);
    }

    @Override
    public void visitCompoundShape(CompoundShape cs) {
        // Export the shape’s ID as well as the list of its children’s IDs.
        System.out.println("Exporting CompoundShape: ID = " + cs.id + ", contains shapes:");
        for (Shape shape : cs.children) {
            shape.accept(this);
        }
    }
}