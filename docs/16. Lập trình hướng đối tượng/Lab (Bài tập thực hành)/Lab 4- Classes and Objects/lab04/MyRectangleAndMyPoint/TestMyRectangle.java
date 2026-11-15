package hus.oop.lab.lab04.MyRectangleAndMyPoint;

public class TestMyRectangle {
    public static void main(String[] args) {
        // Test constructors
        MyRectangle rectangle1 = new MyRectangle(0, 0, 3, 4);
        MyRectangle rectangle2 = new MyRectangle(new MyPoint(0, 0), new MyPoint(3, 4));

        // Test toString() method
        System.out.println("String representation of rectangle1: " + rectangle1);
        System.out.println("String representation of rectangle2: " + rectangle2);

        // Test getArea() method
        System.out.println("Area of rectangle1: " + rectangle1.getArea());
        System.out.println("Area of rectangle2: " + rectangle2.getArea());

        // Test getPerimeter() method
        System.out.println("Perimeter of rectangle1: " + rectangle1.getPerimeter());
        System.out.println("Perimeter of rectangle2: " + rectangle2.getPerimeter());
    }
}
