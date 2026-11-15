package hus.oop.lab.lab11.interatorpattern.pseudocode;

public class FacebookIterator implements ProfileIterator{
    private Facebook facebook;
    private String profileId;
    private String type;
    private int currentPosition = 0;
    private Profile[] cache;

    public FacebookIterator(Facebook facebook, String profileId, String type) {
        this.facebook = facebook;
        this.profileId = profileId;
        this.type = type;
        this.cache = null;
        lazyInit();
    }

    private void lazyInit() {
        if (cache == null) {
            cache = facebook.socialGraphRequest(profileId, type);
        }
    }

    @Override
    public Profile getNext() {
        if (hasMore()) {
            return cache[currentPosition++];
        }
        return null;
    }

    @Override
    public boolean hasMore() {
        lazyInit();
        return currentPosition < cache.length;
    }
}
