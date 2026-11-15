package hus.oop.integration;

public class MyArrayPolynomial extends MyAbstractPolynomial {
    private static final int DEFAULT_CAPACITY = 8;
    private double[] coefficients;
    private int size;

    /**
     * Khởi tạo dữ liệu mặc định.
     */
    public MyArrayPolynomial() {
        coefficients = new double[DEFAULT_CAPACITY];
        size = 0;
    }
    

    public int getSize() {
        return size;
    }


    @Override
    public double coefficient(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", size: " + size);
        }
        return coefficients[index];
    }

    @Override
    public double[] coefficients() {
        double[] result = new double[size];
        for (int i = 0; i < size; i++) {
            result[i] = coefficients[i];
        }
        return result;
    }

    @Override
    public MyArrayPolynomial append(double coefficient) {
        if (size == coefficients.length) {
            allocateMore();
        }
        coefficients[size++] = coefficient;
        return this;
    }

    @Override
    public MyArrayPolynomial add(double coefficient, int index) {
        if (index < 0 || index > size) {
            return this;
        }
        if (size == coefficients.length) {
            allocateMore();
        }
        for (int i = size; i > index; i--) {
            coefficients[i] = coefficients[i - 1];
        }
        coefficients[index] = coefficient;
        size++;
        return this;
    }

    @Override
    public MyArrayPolynomial set(double coefficient, int index) {
        if (index < 0 || index >= size) {
            return this;
        }
        coefficients[index] = coefficient;
        return this;
    }

    @Override
    public int degree() {
        return size - 1;
    }

    @Override
    public double evaluate(double x) {
        double result = 0;
        for (int i = size - 1; i >= 0; i--) {
            result = result * x + coefficients[i];
        }
        return result;
    }

    @Override
    public MyArrayPolynomial derivative() {
        MyArrayPolynomial result = new MyArrayPolynomial();
        for (int i = 1; i < size; i++) {
            result.append(coefficients[i] * i);
        }
        return result;
    }

    @Override
    public MyArrayPolynomial plus(MyPolynomial right) {
        MyArrayPolynomial result = new MyArrayPolynomial();
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
    public MyArrayPolynomial minus(MyPolynomial right) {
        MyArrayPolynomial result = new MyArrayPolynomial();
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
    public MyArrayPolynomial multiply(MyPolynomial right) {
        double[] result = new double[this.degree() + right.degree() + 1];
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < right.degree() + 1; j++) {
                result[i + j] += coefficient(i) * right.coefficient(j);
            }
        }
        MyArrayPolynomial finalResult = new MyArrayPolynomial();
        for (double d : result) {
            finalResult.append(d);
        }
        return finalResult;
    }

    /**
     * Tăng kích thước mảng lên gấp đôi để lưu đa thức khi cần thiết.
     */
    private void allocateMore() {
        double[] newCoefficients = new double[coefficients.length * 2];
        for (int i = 0; i < size; i++) {
            newCoefficients[i] = coefficients[i];
        }
        coefficients = newCoefficients;
    }
}
