package hus.oop.lab.lab11.visitorpattern.computer;

public interface ComputerPart {
    void accept(ComputerPartVisitor computerPartVisitor);
}