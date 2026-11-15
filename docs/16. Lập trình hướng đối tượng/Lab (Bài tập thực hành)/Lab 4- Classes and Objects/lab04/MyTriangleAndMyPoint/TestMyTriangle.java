package hus.oop.lab.lab04.MyTriangleAndMyPoint;

public class TestMyTriangle {
    public static void main(String[] args) {
        // Test constructors
        MyTriangle triangle1 = new MyTriangle(0, 0, 3, 0, 0, 4);
        MyTriangle triangle2 = new MyTriangle(new MyPoint(0, 0), new MyPoint(3, 0), new MyPoint(0, 4));

        // Test toString() method
        System.out.println("String representation of triangle1: " + triangle1);
        System.out.println("String representation of triangle2: " + triangle2);

        // Test getPerimeter() method
        System.out.println("Perimeter of triangle1: " + triangle1.getPerimeter());
        System.out.println("Perimeter of triangle2: " + triangle2.getPerimeter());

        // Test getType() method
        System.out.println("Type of triangle1: " + triangle1.getType());
        System.out.println("Type of triangle2: " + triangle2.getType());
    }
}
