package hus.oop.lab.lab04.MyLineAndMyPoint;

public class TestMyLine {
    public static void main(String[] args) {
        // Test constructors
        MyPoint begin = new MyPoint(1, 2);
        MyPoint end = new MyPoint(4, 5);
        MyLine line1 = new MyLine(begin, end);
        MyLine line2 = new MyLine(2, 3, 6, 7);

        // Test getters and setters
        System.out.println("Begin point of line1: " + line1.getBegin());
        System.out.println("End point of line1: " + line1.getEnd());
        System.out.println("Begin point X coordinate of line1: " + line1.getBeginX());
        System.out.println("Begin point Y coordinate of line1: " + line1.getBeginY());
        System.out.println("End point X coordinate of line1: " + line1.getEndX());
        System.out.println("End point Y coordinate of line1: " + line1.getEndY());

        // Test setting new values
        line1.setBegin(new MyPoint(0, 0));
        line1.setEnd(new MyPoint(10, 10));
        System.out.println("Begin point of line1 after setting new values: " + line1.getBegin());
        System.out.println("End point of line1 after setting new values: " + line1.getEnd());

        // Test other methods
        System.out.println("Begin point coordinates of line2: " + java.util.Arrays.toString(line2.getBeginXY()));
        System.out.println("End point coordinates of line2: " + java.util.Arrays.toString(line2.getEndXY()));
        System.out.println("Length of line2: " + line2.getLength());
        System.out.println("Gradient of line2: " + line2.getGradient());
        System.out.println("String representation of line1: " + line1);
        System.out.println("String representation of line2: " + line2);
    }
}
