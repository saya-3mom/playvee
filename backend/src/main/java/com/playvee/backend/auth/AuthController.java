package com.playvee.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository users;
    public AuthController(AppUserRepository users) { this.users = users; }

    @GetMapping("/csrf")
    public void csrf(CsrfToken token) { token.getToken(); }

    @GetMapping("/me")
    public CurrentUser me(Authentication authentication) {
        var user = users.findByLoginIdAndDeletedAtIsNull(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return new CurrentUser(user.getId(), user.getLoginId());
    }

    public record CurrentUser(Long id, String loginId) {}
}
