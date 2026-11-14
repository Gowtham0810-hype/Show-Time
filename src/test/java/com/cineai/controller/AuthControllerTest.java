package com.cineai.controller;

import com.cineai.model.dto.request.LoginRequest;
import com.cineai.model.dto.request.RegisterRequest;
import com.cineai.model.enums.UserRole;
import com.cineai.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldRegisterNewUserSuccessfully() throws Exception {
        String uniqueEmail = "testuser_" + System.currentTimeMillis() + "@cineai.com";
        RegisterRequest request = RegisterRequest.builder()
                .email(uniqueEmail)
                .password("password123")
                .fullName("Test User")
                .role(UserRole.USER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(uniqueEmail))
                .andExpect(jsonPath("$.data.user.fullName").value("Test User"))
                .andExpect(jsonPath("$.data.user.role").value("USER"));
    }

    @Test
    void shouldFailRegisterWithDuplicateEmail() throws Exception {
        String email = "duplicate_" + System.currentTimeMillis() + "@cineai.com";
        RegisterRequest request = RegisterRequest.builder()
                .email(email)
                .password("password123")
                .fullName("Original User")
                .role(UserRole.USER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second registration with the same email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
        String email = "login_test_" + System.currentTimeMillis() + "@cineai.com";
        RegisterRequest registerReq = RegisterRequest.builder()
                .email(email)
                .password("securePass123")
                .fullName("Login User")
                .role(UserRole.USER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = LoginRequest.builder()
                .email(email)
                .password("securePass123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(email));
    }

    @Test
    void shouldFailLoginWithIncorrectPassword() throws Exception {
        String email = "fail_login_" + System.currentTimeMillis() + "@cineai.com";
        RegisterRequest registerReq = RegisterRequest.builder()
                .email(email)
                .password("correctPassword")
                .fullName("Fail Login User")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = LoginRequest.builder()
                .email(email)
                .password("wrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void shouldPreventPrivilegeEscalationOnRegistration() throws Exception {
        String email = "hacker_" + System.currentTimeMillis() + "@cineai.com";
        String rawJson = String.format("{\"email\":\"%s\",\"password\":\"password123\",\"fullName\":\"Hacker\",\"role\":\"ADMIN\"}", email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("USER"));
    }
}
