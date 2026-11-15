package hus.oop.lab.lab04.MyCircleAndMyPoint;

public class TestMyCircle {
    public static void main(String[] args) {
        // Test constructors
        MyCircle circle1 = new MyCircle();
        MyCircle circle2 = new MyCircle(3, 4, 5);
        MyCircle circle3 = new MyCircle(new MyPoint(1, 1), 2);

        // Test getters and setters
        System.out.println("Radius of circle1: " + circle1.getRadius());
        System.out.println("Center of circle1: " + circle1.getCenter());
        System.out.println("Center X coordinate of circle1: " + circle1.getCenterX());
        System.out.println("Center Y coordinate of circle1: " + circle1.getCenterY());

        // Test setting new values
        circle1.setRadius(3);
        circle1.setCenter(new MyPoint(2, 2));
        System.out.println("Radius of circle1 after setting new values: " + circle1.getRadius());
        System.out.println("Center of circle1 after setting new values: " + circle1.getCenter());

        // Test other methods
        System.out.println("Area of circle2: " + circle2.getArea());
        System.out.println("Circumference of circle2: " + circle2.getCircumference());
        System.out.println("Distance between circle2 and circle3: " + circle2.distance(circle3));
        System.out.println("String representation of circle1: " + circle1);
        System.out.println("String representation of circle2: " + circle2);
        System.out.println("String representation of circle3: " + circle3);
    }
}
