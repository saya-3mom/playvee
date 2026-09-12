package com.playvee.backend.auth;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:auth;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false",
    "playvee.bootstrap.login-id=", "playvee.bootstrap.password-hash="
})
@AutoConfigureMockMvc
class SecurityIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired AppUserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired JdbcTemplate jdbc;
    private final String testPassword = "integration-test-only";

    @BeforeEach void setup() {
        users.deleteAll();
        users.save(new AppUser("owner", encoder.encode(testPassword)));
    }

    private Cookie csrf(MockHttpSession session) throws Exception {
        var request = get("/api/auth/csrf");
        if (session != null) request.session(session);
        var response = mvc.perform(request).andExpect(status().isOk()).andReturn().getResponse();
        var cookie = response.getCookie("XSRF-TOKEN");
        assertNotNull(cookie);
        assertFalse(cookie.isHttpOnly());
        return cookie;
    }

    @Test void anonymousCannotReadOrWriteOrDownload() throws Exception {
        mvc.perform(get("/api/parks")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/parks/1/photos/1/image")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/parks").contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test void loginSessionCsrfAndLogout() throws Exception {
        var token = csrf(null);
        mvc.perform(post("/api/auth/login").param("loginId", "owner").param("password", testPassword))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").cookie(token).header("X-XSRF-TOKEN", token.getValue())
                .param("loginId", "owner").param("password", "wrong"))
                .andExpect(status().isUnauthorized());
        var result = mvc.perform(post("/api/auth/login").cookie(token).header("X-XSRF-TOKEN", token.getValue())
                .param("loginId", "owner").param("password", testPassword))
                .andExpect(status().isOk()).andReturn();
        var session = (MockHttpSession) result.getRequest().getSession(false);
        assertNotNull(session);
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.loginId").value("owner"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        mvc.perform(get("/api/parks").session(session)).andExpect(status().isOk());
        mvc.perform(post("/api/parks").session(session).contentType("application/json")
                .content("{\"name\":\"Park\",\"address\":\"Address\"}"))
                .andExpect(status().isForbidden());
        var fresh = csrf(session);
        mvc.perform(post("/api/parks").session(session).cookie(fresh).header("X-XSRF-TOKEN", fresh.getValue())
                .contentType("application/json").content("{\"name\":\"Park\",\"address\":\"Address\"}"))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/auth/logout").session(session).cookie(fresh).header("X-XSRF-TOKEN", fresh.getValue()))
                .andExpect(status().isNoContent());
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test void deletedUserCannotLogin() throws Exception {
        jdbc.update("update app_users set deleted_at = CURRENT_TIMESTAMP where login_id = ?", "owner");
        var token = csrf(null);
        mvc.perform(post("/api/auth/login").cookie(token).header("X-XSRF-TOKEN", token.getValue())
                .param("loginId", "owner").param("password", testPassword))
                .andExpect(status().isUnauthorized());
    }
}
