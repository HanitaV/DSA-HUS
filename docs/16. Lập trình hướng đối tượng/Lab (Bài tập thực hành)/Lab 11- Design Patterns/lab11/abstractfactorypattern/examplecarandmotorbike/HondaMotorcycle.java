package hus.oop.lab.lab11.abstractfactorypattern.examplecarandmotorbike;

public class HondaMotorcycle implements Motorcycle {
    @Override
    public void ride() {
        System.out.println("Riding a HondaMotorcycle");
    }
}
