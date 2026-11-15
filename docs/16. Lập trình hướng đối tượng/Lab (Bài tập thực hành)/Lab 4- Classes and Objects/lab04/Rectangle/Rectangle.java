package hus.oop.lab.lab04.Rectangle;

public class Rectangle {
    private float length, width;

    public Rectangle() {
        length = 1.0f;
        width  = 1.0f;
    }

    public Rectangle(float length, float width) {
        this.length = length;
        this.width  = width;
    }

    public double getLength() {
        return length;
    }

    public void setLength(float newLength) {
        length = newLength;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(float newWidth) {
        width = newWidth;
    }

    public double getArea() {
        return length * width;
    }

    public double getPerimeter() {
        return 2.0 * (length + width);
    }

    /** Return a self-descriptive string of this instance in the form of Circle[radius=?] */
    public String toString() {
        return "Rectangle[length=" + this.length + ",width=" + this.width + "]";
    }
}