package com.sentinel.auth;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final LoginAttemptService loginAttemptService;
    private final UserService userService;

    // In-memory token store for Password Reset Tokens (valid for 15 minutes)
    private static final Map<String, ResetTokenEntry> resetTokens = new ConcurrentHashMap<>();

    private static class ResetTokenEntry {
        String username;
        long expiryTime;

        ResetTokenEntry(String username) {
            this.username = username;
            this.expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(15);
        }
    }

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          LoginAttemptService loginAttemptService,
                          UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.loginAttemptService = loginAttemptService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Validated @RequestBody LoginRequest req) {
        String identifier = req.getUsername().trim();

        // 1. Rate Limiting / Brute-Force Check
        if (loginAttemptService.isLocked(identifier)) {
            long remaining = loginAttemptService.getRemainingLockMinutes(identifier);
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many failed login attempts. Account temporarily locked. Please try again in "
                            + remaining + " minutes.");
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, req.getPassword()));

            User user = (User) auth.getPrincipal();

            // Clear failure attempts on success
            loginAttemptService.loginSucceeded(identifier);

            // Persistent Session Opt-in (Remember Me: 30 days vs standard 24 hours)
            long tokenDuration = req.isRememberMe()
                    ? TimeUnit.DAYS.toMillis(30)
                    : TimeUnit.HOURS.toMillis(24);

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), tokenDuration);
            return new AuthResponse(token, user.getUsername(), user.getRole().name());

        } catch (BadCredentialsException e) {
            loginAttemptService.loginFailed(identifier);
            // Generic Error Message to protect against user enumeration
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody Map<String, String> payload) {
        String identifier = payload.get("email");
        if (identifier == null || identifier.isBlank()) {
            identifier = payload.get("username");
        }

        if (identifier != null && !identifier.isBlank()) {
            String token = UUID.randomUUID().toString();
            resetTokens.put(token, new ResetTokenEntry(identifier.trim()));
            // In a production setup, dispatch email with reset link containing ?token=...
        }

        // Generic response prevents user enumeration
        return Map.of("message", "If an account matches that email address, a password reset link has been dispatched.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (token == null || newPassword == null || newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token or password does not meet requirements.");
        }

        ResetTokenEntry entry = resetTokens.get(token);
        if (entry == null || entry.expiryTime < System.currentTimeMillis()) {
            resetTokens.remove(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link has expired or is invalid.");
        }

        // Reset password for the associated user
        userService.updatePassword(entry.username, newPassword);
        resetTokens.remove(token);
        return Map.of("message", "Password has been reset successfully. You may now sign in.");
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = (User) userDetails;
        return Map.of(
                "username", user.getUsername(),
                "role", user.getRole().name()
        );
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Logged out. Please discard your token.");
    }
}
