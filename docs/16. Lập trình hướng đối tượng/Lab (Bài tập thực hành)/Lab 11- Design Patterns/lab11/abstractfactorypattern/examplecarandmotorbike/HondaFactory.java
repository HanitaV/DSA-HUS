package hus.oop.lab.lab11.abstractfactorypattern.examplecarandmotorbike;

public class HondaFactory implements AbstractFactory {
    @Override
    public Car createCar() {
        return new HondaCar();
    }

    @Override
    public Motorcycle createMotorcycle() {
        return new HondaMotorcycle();
    }
}
