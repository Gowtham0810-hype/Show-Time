package com.cineai.controller;

import com.cineai.model.dto.request.RegisterRequest;
import com.cineai.model.dto.response.AlertResponse;
import com.cineai.model.dto.response.AuthResponse;
import com.cineai.model.enums.UserRole;
import com.cineai.service.AlertService;
import com.cineai.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private AlertService alertService;

    private String userToken;
    private Long userId;

    @BeforeEach
    void setUp() {
        String email = "alertuser_" + System.currentTimeMillis() + "@cineai.com";
        AuthResponse auth = authService.register(RegisterRequest.builder()
                .email(email)
                .password("password123")
                .fullName("Alert Tester")
                .role(UserRole.USER)
                .build());
        this.userToken = auth.getToken();
        this.userId = auth.getUser().getId();
    }

    @Test
    void shouldListUserAlertsAndCancelAlert() throws Exception {
        // Create an alert directly via AlertService
        AlertResponse alert = alertService.createAlert(userId, "Pushpa 3", "PVR Phoenix", "Bangalore", "IMAX");

        // 1. Get user alerts
        mockMvc.perform(get("/api/alerts/my")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].movieTitle").value("Pushpa 3"));

        // 2. Cancel alert
        mockMvc.perform(delete("/api/alerts/" + alert.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        // 3. Verify active alerts list is now empty for this alert
        mockMvc.perform(get("/api/alerts/my")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }
}
