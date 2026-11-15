package hus.oop.lab.lab04.Circle;
/**
 * A Test Driver for the Circle class
 */
public class TestCircle { // Save as "TestCircle.java"

    public static void main(String[] args) {
        // Declare an instance of Circle class called circle1.
        // Construct the instance circle1 by invoking the "default" constructor
        // which sets its radius and color to their default value.
        Circle circle1 = new Circle();

        // Invoke public methods on instance circle1, via dot operator.
        System.out.println("The circle has radius of " +
                circle1.getRadius() + " and area of " + circle1.getArea());

        // Declare an instance of class circle called circle2.
        // Construct the instance circle2 by invoking the second constructor
        // with the given radius and default color.
        Circle circle2 = new Circle(2.0);

        // Invoke public methods on instance circle2, via dot operator.
        System.out.println("The circle has radius of " +
                circle2.getRadius() + " and area of " + circle2.getArea());

        // Construct an instance of Circle
        Circle circle4 = new Circle();
        circle4.setRadius(5.5); // change radius
        System.out.println("Radius is: " + circle4.getRadius()); // Print radius via getter
        circle4.setColor("green"); // Change color
        System.out.println("Color is: " + circle4.getColor()); // Print color via getter

        // You cannot do the following because setRadius() returns void,
        // which cannot be printed
        // System.out.println(circle4.setRadius(4.4));

        Circle circle5 = new Circle(5.5);
        System.out.println(circle5.toString());

        Circle circle6 = new Circle(6.6);
        System.out.println(circle6.toString()); // explicit call
        System.out.println(circle6); // println() calls toString() implicitly, same as above
        System.out.println("Operator '+' invokes toString() too: " + circle6); // '+' invokes toString() too
    }
}
