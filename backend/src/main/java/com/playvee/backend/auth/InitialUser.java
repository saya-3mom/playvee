package com.playvee.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InitialUser implements ApplicationRunner {
    private final AppUserRepository users;
    private final String loginId;
    private final String hash;

    public InitialUser(AppUserRepository users,
            @Value("${playvee.bootstrap.login-id:}") String loginId,
            @Value("${playvee.bootstrap.password-hash:}") String hash) {
        this.users = users;
        this.loginId = loginId;
        this.hash = hash;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() != 0 || (loginId.isBlank() && hash.isBlank())) return;
        if (loginId.isBlank() || loginId.length() > 200
                || !hash.matches("\\{bcrypt}\\$2[aby]\\$(1[0-6])\\$[./A-Za-z0-9]{53}")) {
            throw new IllegalStateException("Invalid initial user configuration: use a login ID and a {bcrypt} hash (cost 10-16)");
        }
        users.save(new AppUser(loginId.strip(), hash));
    }
}
