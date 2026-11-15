package hus.oop.lab.lab11.interatorpattern.pseudocode;

public class Main {
    public static void main(String[] args) {
        testSendSpamToFriends();
        testSendSpamToCoworkers();
    }

    public static void testSendSpamToFriends() {
        System.out.println("Test send spam to friends:");
        // Initialize application
        Application app = new Application();
        app.config();

        // Create a test profile
        Profile testProfile = new Profile("testProfileId", "test@example.com");

        // Send spam to friends
        app.sendSpamToFriends(testProfile);
    }

    public static void testSendSpamToCoworkers() {
        System.out.println("Test send spam to coworkers:");
        // Initialize application
        Application app = new Application();
        app.config();

        // Create a test profile
        Profile testProfile = new Profile("testProfileId", "test@example.com");

        // Send spam to coworkers
        app.sendSpamToCoworkers(testProfile);
    }
}
