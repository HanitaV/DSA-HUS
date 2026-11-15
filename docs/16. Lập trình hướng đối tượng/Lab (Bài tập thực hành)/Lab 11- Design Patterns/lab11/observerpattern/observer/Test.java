package hus.oop.lab.lab11.observerpattern.observer;

public class Test {
    public static void main(String[] args) {
        Subject subject = new Subject();
        Observer observer1 = new Observer() {
            @Override
            public void update(String message) {
                System.out.println("message 1 changed: " + message);
            }
        };
        Observer observer2 = new Observer() {
            @Override
            public void update(String message) {
                System.out.println("Message 2 changed: " + message);
            }
        };
        subject.attach(observer1);
        subject.attach(observer2);
        subject.notifyChange("Test change state 1");
        subject.detach(observer1);
        subject.notifyChange("Test change state 2");
    }
}
