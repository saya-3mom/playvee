package com.playvee.backend.auth;

import com.playvee.backend.common.model.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_users")
public class AppUser extends AbstractEntity {
    @Column(name = "login_id", nullable = false, unique = true, length = 200)
    private String loginId;
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    protected AppUser() {}
    public AppUser(String loginId, String passwordHash) {
        this.loginId = loginId;
        this.passwordHash = passwordHash;
    }
    public String getLoginId() { return loginId; }
    public String getPasswordHash() { return passwordHash; }
}
