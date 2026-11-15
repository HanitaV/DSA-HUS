package hus.oop.lab.lab04.CustomerAndAccount;

public class Account {
    private String id;
    private Customer customer;
    private double balance = 0.0f;

    public Account(String id, Customer customer){
        this.id = id;
        this.customer = customer;
    }

    public Account(String id, Customer customer, double balance){
        this.id = id;
        this.customer = customer;
        this.balance = balance;
    }

    public String getID(){
        return id;
    }

    public double getBalance(){
        return balance;
    }

    public Customer getCustomer() {
        return customer;
    }
    public Account deposit(double amount){
        if (amount <= balance)
            balance -= amount;
        else
            System.out.println("Amount withdrawn exceeds the curent balance!");

        return this;
    }

    public String getCustomerName() {
        return this.customer.getName();
    }

    public String toString(){
        return customer.getName() + "balance=$" + Math.round(balance * 100.00) / 100.00;
    }
}