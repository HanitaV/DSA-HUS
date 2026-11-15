package hus.oop.lab.lab11.abstractfactorypattern.examplecarandmotorbike;

public class HondaCar implements Car {
    @Override
    public void drive() {
        System.out.println("Driving a Honda car");
    }
}
