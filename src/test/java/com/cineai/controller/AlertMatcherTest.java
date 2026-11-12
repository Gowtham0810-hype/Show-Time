package com.cineai.controller;

import com.cineai.model.dto.request.CreateShowtimeRequest;
import com.cineai.model.dto.request.RegisterRequest;
import com.cineai.model.dto.response.AlertResponse;
import com.cineai.model.dto.response.AuthResponse;
import com.cineai.model.entity.Movie;
import com.cineai.model.entity.MovieAlert;
import com.cineai.model.entity.Showtime;
import com.cineai.model.entity.Theater;
import com.cineai.model.enums.AlertStatus;
import com.cineai.model.enums.ShowtimeStatus;
import com.cineai.model.enums.UserRole;
import com.cineai.repository.MovieAlertRepository;
import com.cineai.repository.MovieRepository;
import com.cineai.repository.ShowtimeRepository;
import com.cineai.repository.TheaterRepository;
import com.cineai.service.AdminService;
import com.cineai.service.AlertMatcherService;
import com.cineai.service.AlertService;
import com.cineai.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AlertMatcherTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private AlertService alertService;

    @Autowired
    private AlertMatcherService alertMatcherService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private MovieAlertRepository alertRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private com.cineai.repository.UserRepository userRepository;

    private String userToken;
    private Long userId;

    @BeforeEach
    void setUp() {
        String email = "alertuser_match_" + System.currentTimeMillis() + "@cineai.com";
        AuthResponse auth = authService.register(RegisterRequest.builder()
                .email(email)
                .password("password123")
                .fullName("Alert Subscriber")
                .role(UserRole.USER)
                .build());
        this.userToken = auth.getToken();
        this.userId = auth.getUser().getId();
    }

    @Test
    void shouldTriggerAlertAndNotifyUserWhenShowtimeIsAdded() throws Exception {
        Movie movie = movieRepository.findAll().get(0);
        Theater theater = theaterRepository.findAll().get(0);

        // 1. User sets alert for this movie at this theater
        AlertResponse alertRes = alertService.createAlert(
                userId, movie.getTitle(), theater.getName(), theater.getCity(), null);
        assertNotNull(alertRes.getId());
        assertEquals(AlertStatus.ACTIVE, alertRes.getStatus());

        // 2. Admin creates a new showtime matching this alert
        CreateShowtimeRequest showtimeReq = CreateShowtimeRequest.builder()
                .movieId(movie.getId())
                .theaterId(theater.getId())
                .showDate(LocalDate.now().plusDays(5))
                .showTime(LocalTime.of(19, 30))
                .price(new BigDecimal("350.00"))
                .status(ShowtimeStatus.ACTIVE)
                .build();

        adminService.createShowtime(showtimeReq);

        // 3. Verify alert status transitioned to TRIGGERED
        MovieAlert updatedAlert = alertRepository.findById(alertRes.getId()).orElseThrow();
        assertEquals(AlertStatus.TRIGGERED, updatedAlert.getStatus());
        assertNotNull(updatedAlert.getNotifiedAt());

        // 4. Verify in-app notifications API returns the notification
        mockMvc.perform(get("/api/notifications/my")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].movieTitle").value(movie.getTitle()))
                .andExpect(jsonPath("$.data[0].theaterName").value(theater.getName()));
    }

    @Test
    void shouldMatchAlertsViaScheduledMatcher() throws Exception {
        Movie movie = movieRepository.findAll().get(0);
        Theater theater = theaterRepository.findAll().get(0);

        // 1. Create an active alert
        AlertResponse alertRes = alertService.createAlert(
                userId, movie.getTitle(), theater.getName(), theater.getCity(), null);

        // Small pause to guarantee showtime creation timestamp is >= alert creation timestamp
        Thread.sleep(20);

        // 2. Save a showtime directly to repository
        Showtime newShowtime = Showtime.builder()
                .movie(movie)
                .theater(theater)
                .showDate(LocalDate.now().plusDays(7))
                .showTime(LocalTime.of(21, 0))
                .price(new BigDecimal("400.00"))
                .status(ShowtimeStatus.ACTIVE)
                .build();
        showtimeRepository.save(newShowtime);

        // 3. Run scheduled matcher
        int triggered = alertMatcherService.matchAlerts();
        assertTrue(triggered >= 1, "Should have triggered at least 1 matching alert");

        MovieAlert verified = alertRepository.findById(alertRes.getId()).orElseThrow();
        assertEquals(AlertStatus.TRIGGERED, verified.getStatus());
        assertNotNull(verified.getNotifiedAt());
    }
}
