package hus.oop.lab.lab11.interatorpattern.pseudocode;

public class SocialSpammer {
    public void send(ProfileIterator iterator, String message) {
        while (iterator.hasMore()) {
            Profile profile = iterator.getNext();
            SystemFacebook.sendEmail(profile.getEmail(), message);
        }
    }
}
