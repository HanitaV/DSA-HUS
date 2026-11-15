package hus.oop.lab.lab11.abstractfactorypattern.examplecarandmotorbike;

public class ApplicationConfigurator {
    public static void main(String[] args) {
        AbstractFactory factory;

        factory = new HondaFactory();
        Application app = new Application(factory);
        app.CreateCar();
        app.CreateMotorcycle();
        app.DriveCar();
        app.RideMotorcycle();
    }
}
