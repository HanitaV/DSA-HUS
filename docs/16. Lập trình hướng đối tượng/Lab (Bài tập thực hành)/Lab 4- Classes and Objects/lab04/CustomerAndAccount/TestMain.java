package hus.oop.lab.lab04.CustomerAndAccount;

public class TestMain {
    public static void main(String[] args) {
        Customer customer1 = new Customer(101, "John", 'M');
        Account account1 = new Account("A101", customer1, 1000.0);

        System.out.println("Account ID: " + account1.getID());
        System.out.println("Customer Name: " + account1.getCustomerName());
        System.out.println("Initial Balance: $" + account1.getBalance());

        // Deposit $200
        account1.deposit(200.0);
        System.out.println("New Balance after deposit: $" + account1.getBalance());

        // Attempt to withdraw $1500 (exceeds balance)
        account1.deposit(1500.0);

        // Display updated balance
        System.out.println("Final Balance: $" + account1.getBalance());
    }
}
