
package com.sentinel.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Creates the initial admin account on first run if no users exist.
 * The password is loaded from the SENTINEL_ADMIN_PASSWORD environment variable.
 * Never commits a real password to source control.
 */
@Component
public class InitialAdminSetup implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(InitialAdminSetup.class);

    private final UserService userService;
    private final String adminUsername;
    private final String adminPassword;

    public InitialAdminSetup(UserService userService,
                             @Value("${sentinel.admin.username:admin}") String adminUsername,
                             @Value("${sentinel.admin.password:#{null}}") String adminPassword) {
        this.userService = userService;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (userService.usersExist()) {
            log.info("Users already exist, skipping initial admin setup.");
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("SENTINEL_ADMIN_PASSWORD is not set. Skipping initial admin creation. " +
                    "Set sentinel.admin.password in application.properties or " +
                    "the SENTINEL_ADMIN_PASSWORD environment variable.");
            return;
        }
        userService.createUser(adminUsername, adminPassword, Role.ADMIN);
        log.info("Created initial admin account: {}", adminUsername);
    }
}
