package hus.oop.lab.lab11.abstractfactorypattern.examplecarandmotorbike;

public class ToyotaFactory implements AbstractFactory {
    @Override
    public Car createCar() {
        return new ToyotaCar();
    }

    @Override
    public Motorcycle createMotorcycle() {
        return new ToyotaMotorcycle();
    }
}
