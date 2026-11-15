package hus.oop.lab.lab11.interatorpattern.pseudocode;

import java.util.*;

public class Facebook implements SocialNetwork {
    private List<Profile> profiles;

    @Override
    public ProfileIterator createFriendsIterator(String profileId) {
        return new FacebookIterator(this, profileId, "friends");
    }

    @Override
    public ProfileIterator createCoworkersIterator(String profileId) {
        return new FacebookIterator(this, profileId, "coworkers");
    }
    public Facebook() {
        profiles = new ArrayList<>();
        profiles.add(new Profile("1", "friend1@example.com"));
        profiles.add(new Profile("2", "friend2@example.com"));
        profiles.add(new Profile("3", "coworker1@example.com"));
        profiles.add(new Profile("4", "coworker2@example.com"));
    }

    // Method to simulate a request to the social graph API
    public Profile[] socialGraphRequest(String profileId, String type) {
        List<Profile> result = new ArrayList<>();
        for (Profile profile : profiles) {
            if (type.equals("friends") && profile.getEmail().contains("friend")) {
                result.add(profile);
            } else if (type.equals("coworkers") && profile.getEmail().contains("coworker")) {
                result.add(profile);
            }
        }
        return result.toArray(new Profile[0]);
    }
}
