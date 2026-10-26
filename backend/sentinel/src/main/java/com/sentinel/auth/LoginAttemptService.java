package com.sentinel.auth;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Component;

/**
 * In-memory brute force protection & rate-limiter.
 * Locks an identifier (email/username/IP) for 15 minutes after 5 failed attempts.
 */
@Component
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MS = TimeUnit.MINUTES.toMillis(15);

    private static class Attempt {
        int count;
        long lastAttemptTime;
        long lockedUntil;

        Attempt(long time) {
            this.count = 1;
            this.lastAttemptTime = time;
            this.lockedUntil = 0;
        }
    }

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    public boolean isLocked(String key) {
        if (key == null) return false;
        String normalizedKey = key.trim().toLowerCase();
        Attempt attempt = attempts.get(normalizedKey);
        if (attempt == null) return false;

        long now = System.currentTimeMillis();
        if (attempt.lockedUntil > now) {
            return true;
        }

        // If lock period has expired, reset
        if (attempt.lockedUntil > 0 && attempt.lockedUntil <= now) {
            attempts.remove(normalizedKey);
            return false;
        }

        return false;
    }

    public long getRemainingLockMinutes(String key) {
        if (key == null) return 0;
        Attempt attempt = attempts.get(key.trim().toLowerCase());
        if (attempt == null || attempt.lockedUntil <= System.currentTimeMillis()) return 0;
        long remainingMs = attempt.lockedUntil - System.currentTimeMillis();
        return Math.max(1, TimeUnit.MILLISECONDS.toMinutes(remainingMs) + 1);
    }

    public void loginFailed(String key) {
        if (key == null) return;
        String normalizedKey = key.trim().toLowerCase();
        long now = System.currentTimeMillis();

        attempts.compute(normalizedKey, (k, existing) -> {
            if (existing == null) {
                return new Attempt(now);
            }
            // Reset attempts if previous attempt was more than 15 mins ago
            if (now - existing.lastAttemptTime > LOCK_DURATION_MS) {
                existing.count = 1;
                existing.lastAttemptTime = now;
                existing.lockedUntil = 0;
                return existing;
            }

            existing.count++;
            existing.lastAttemptTime = now;
            if (existing.count >= MAX_ATTEMPTS) {
                existing.lockedUntil = now + LOCK_DURATION_MS;
            }
            return existing;
        });
    }

    public void loginSucceeded(String key) {
        if (key == null) return;
        attempts.remove(key.trim().toLowerCase());
    }
}
