package hus.oop.integration;

import java.util.LinkedList;
import java.util.List;

public class MyListPolynomial extends MyAbstractPolynomial {
    private List<Double> coefficients;

    /**
     * Khởi tạo dữ liệu mặc định.
     */
    public MyListPolynomial() {
        coefficients = new LinkedList<>();
    }

    @Override
    public double coefficient(int index) {
        return coefficients.get(index);
    }

    @Override
    public double[] coefficients() {
        double[] coefs = new double[this.coefficients.size()];
        for (int i = 0; i < coefs.length; i++) {
            coefs[i] = this.coefficients.get(i);
        }
        return coefs;
    }

    @Override
    public MyListPolynomial append(double coefficient) {
        this.coefficients.add(coefficient);
        return this;
    }

    @Override
    public MyListPolynomial add(double coefficient, int index) {
        this.coefficients.add(index, coefficient);
        return this;
    }

    @Override
    public MyListPolynomial set(double coefficient, int index) {
        this.coefficients.set(index, coefficient);
        return this;
    }

    @Override
    public int degree() {
        return coefficients.size() - 1;
    }

    @Override
    public double evaluate(double x) {
        double eval = 0;
        for (int i = 0; i < this.coefficients.size(); i++) {
            eval += this.coefficients.get(i) * Math.pow(x, i);
        }
        return eval;
    }

    @Override
    public MyListPolynomial derivative() {
        MyListPolynomial result = new MyListPolynomial();
        double[] dif = this.differentiate();
        for (double d : dif) {
            result.append(d);
        }
        return result;
    }

    @Override
    public MyListPolynomial plus(MyPolynomial right) {
        MyListPolynomial result = new MyListPolynomial();
        int i = 0;
        for (; i <= Math.min(this.degree(), right.degree()); i++) {
            result.append(this.coefficient(i) + right.coefficient(i));
        }
        if (this.degree() > right.degree()) {
            for (; i <= Math.max(this.degree(), right.degree()); i++) {
                result.append(this.coefficient(i));
            }
        } else {
            for (; i <= Math.max(this.degree(), right.degree()); i++) {
                result.append(right.coefficient(i));
            }
        }
        return result;
    }

    @Override
    public MyListPolynomial minus(MyPolynomial right) {
        MyListPolynomial result = new MyListPolynomial();
        int i = 0;
        for (; i <= Math.min(this.degree(), right.degree()); i++) {
            result.append(this.coefficient(i) - right.coefficient(i));
        }
        if (this.degree() > right.degree()) {
            for (; i <= Math.max(this.degree(), right.degree()); i++) {
                result.append(this.coefficient(i));
            }
        } else {
            for (; i <= Math.max(this.degree(), right.degree()); i++) {
                result.append(- right.coefficient(i));
            }
        }
        return result;
    }

    @Override
    public MyListPolynomial multiply(MyPolynomial right) {
        double[] result = new double[this.degree() + right.degree() + 1];
        for (int i = 0; i < this.coefficients.size(); i++) {
            for (int j = 0; j < right.degree() + 1; j++) {
                result[i + j] += coefficient(i) * right.coefficient(j);
            }
        }
        MyListPolynomial finalResult = new MyListPolynomial();
        for (double d : result) {
            finalResult.append(d);
        }
        return finalResult;
    }
}
