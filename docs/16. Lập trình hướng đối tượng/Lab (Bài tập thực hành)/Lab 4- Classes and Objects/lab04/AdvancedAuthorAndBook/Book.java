package hus.oop.lab.lab04.AdvancedAuthorAndBook;
public class Book {
    private String name;
    private Author[] authors;
    private double price;
    private int qty;

    public Book(String name, Author[] authors, double price) {
        this.name = name;
        this.authors = authors;
        this.price = price;
    }

    public Book(String name, Author[] authors, double price, int qty) {
        this.name = name;
        this.authors = authors;
        this.price = price;
        this.qty = qty;
    }

    public String getName() {
        return name;
    }

    public Author[] getAuthor() {
        return authors;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public String toString() {
        String toStr = "Book[name=" + name + ",authors={";
        for (int author = 0; author < authors.length; author++) {
            toStr += authors[author].toString();
            if (author < authors.length - 1)
                toStr += ",";
        }
        return  toStr + "},price=" + Double.toString(price) + ",qty=" + Integer.toString(qty) + "]";
    }
}
