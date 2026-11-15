package hus.oop.lab.lab04.MyComplex;

import java.util.Scanner;

public class TestMain {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter complex number 1 (real and imaginary art): ");
        double x = sc.nextDouble();
        double y = sc.nextDouble();
        MyComplex complex1 = new MyComplex(x, y);

        System.out.print("Enter complex number 2 (real and imaginary art): ");
        x = sc.nextDouble();
        y = sc.nextDouble();
        MyComplex complex2 = new MyComplex(x, y);

        System.out.println();
        System.out.println("Number 1 is: " + complex1.toString());
        System.out.println(complex1.toString() + " is " + (complex1.isReal() ? "a pure real" : "NOT a pure real") + " number");
        System.out.println(complex1.toString() + " is " + (complex1.isImaginary() ? "a pure imaginary" : "NOT a pure imaginary") + " number");

        System.out.println();
        System.out.println("Number 2 is: " + complex2.toString());
        System.out.println(complex2.toString() + " is " + (complex2.isReal() ? "a pure real" : "NOT a pure real") + " number");
        System.out.println(complex2.toString() + " is " + (complex2.isImaginary() ? "a pure imaginary" : "NOT a pure imaginary") + " number");

        System.out.println();
        System.out.println(complex1.toString() + " is " + (complex1.equals(complex2) ? "equal to" : "NOT equal to") + " " + complex2.toString());

        MyComplex sum = complex1.addNew(complex2);
        System.out.println(complex1.toString() + " + " + complex2.toString() + " = " + sum.toString());
    }
}

