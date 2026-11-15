package hus.oop.lab.lab11.interatorpattern.pseudocode;

public interface SocialNetwork {
    ProfileIterator createFriendsIterator(String profileId);
    ProfileIterator createCoworkersIterator(String profileId);
}
