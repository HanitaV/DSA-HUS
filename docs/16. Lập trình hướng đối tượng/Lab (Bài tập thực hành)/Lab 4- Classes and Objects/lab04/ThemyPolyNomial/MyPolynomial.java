package hus.oop.lab.lab04.ThemyPolyNomial;

public class MyPolynomial {
    private double coeffs[]; //Mảng hệ số

    public MyPolynomial(double... coeffs){
        this.coeffs = coeffs;
    } //Hàm khởi tạp

    public double[] getCoeffs(){
        return coeffs;
    } //Hàm lấy ra mảng hệ số

    public int getDegree(){
        return coeffs.length - 1;
    } //Hàm lấy ra bậc của đa thức

    //Tính giá trị của đa thức tại x
    public double evaluate(double x) {
        double result = 0;
        for (int i = 0; i < coeffs.length; i++) {
            result += coeffs[i] * Math.pow(x, i);
        }
        return result;
    }

    //Cộng hai đa thức với nhau
    public MyPolynomial add(MyPolynomial another) {
        int maxDegree = Math.max(this.getDegree(), another.getDegree());
        double[] resultCoeffs = new double[maxDegree + 1];
        for (int i = 0; i <= maxDegree; i++) {
            double thisCoeff = (i <= this.getDegree()) ? this.coeffs[i] : 0;
            double anotherCoeff = (i <= another.getDegree()) ? another.coeffs[i] : 0;
            resultCoeffs[i] = thisCoeff + anotherCoeff;
        }
        return new MyPolynomial(resultCoeffs);
    }

    //Nhân hai đa thức
    public MyPolynomial multiply(MyPolynomial another) {
        int resultDegree = this.getDegree() + another.getDegree();
        double[] resultCoeffs = new double[resultDegree + 1];
        for (int i = 0; i <= this.getDegree(); i++) {
            for (int j = 0; j <= another.getDegree(); j++) {
                resultCoeffs[i + j] += this.coeffs[i] * another.coeffs[j];
            }
        }
        return new MyPolynomial(resultCoeffs);
    }

    public String toString(){
        StringBuilder sb = new StringBuilder();
        for(int i = coeffs.length - 1; i >= 0; i--){
            if(i == 0){
                sb.append(coeffs[i]);
            }
            else{
                sb.append(coeffs[i] + "x^" + i + " + ");
            }
        }
        return String.valueOf(sb);
    }
}