package hus.oop.lab.lab11.abstractfactorypattern.examplecarandmotorbike;

public class Application {
    AbstractFactory factory;
    Car car;
    Motorcycle motorcycle;

    public Application(AbstractFactory factory) {
        this.factory = factory;
    }

    public void CreateCar() {
        car = factory.createCar();
    }

    public void CreateMotorcycle() {
        motorcycle = factory.createMotorcycle();
    }

    public void DriveCar() {
        car.drive();
    }

    public void RideMotorcycle() {
        motorcycle.ride();
    }
}
