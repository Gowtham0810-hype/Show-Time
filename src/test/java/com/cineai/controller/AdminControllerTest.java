package com.cineai.controller;

import com.cineai.model.dto.request.*;
import com.cineai.model.dto.response.AuthResponse;
import com.cineai.model.enums.MovieStatus;
import com.cineai.model.enums.ScreenType;
import com.cineai.model.enums.UserRole;
import com.cineai.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        // Create Admin Token
        String adminEmail = "admin_test_" + System.currentTimeMillis() + "@cineai.com";
        AuthResponse adminAuth = authService.register(RegisterRequest.builder()
                .email(adminEmail)
                .password("adminSecret123")
                .fullName("Admin Test")
                .role(UserRole.ADMIN)
                .build());
        this.adminToken = adminAuth.getToken();

        // Create User Token
        String userEmail = "user_test_" + System.currentTimeMillis() + "@cineai.com";
        AuthResponse userAuth = authService.register(RegisterRequest.builder()
                .email(userEmail)
                .password("userSecret123")
                .fullName("User Test")
                .role(UserRole.USER)
                .build());
        this.userToken = userAuth.getToken();
    }

    @Test
    void shouldDenyAccessToAdminEndpointsWithoutToken() throws Exception {
        mockMvc.perform(get("/api/admin/movies"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldDenyAccessToAdminEndpointsWithUserToken() throws Exception {
        mockMvc.perform(get("/api/admin/movies")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowAdminToManageMoviesTheatersAndShowtimes() throws Exception {
        // 1. Create Movie
        CreateMovieRequest movieReq = CreateMovieRequest.builder()
                .title("The Matrix Resurrections")
                .genre("Sci-Fi")
                .language("English")
                .durationMins(148)
                .director("Lana Wachowski")
                .status(MovieStatus.NOW_SHOWING)
                .build();

        MvcResult movieResult = mockMvc.perform(post("/api/admin/movies")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(movieReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("The Matrix Resurrections"))
                .andReturn();

        Long movieId = objectMapper.readTree(movieResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // 2. Create Theater
        CreateTheaterRequest theaterReq = CreateTheaterRequest.builder()
                .name("PVR Vega City")
                .location("Bannerghatta Road")
                .city("Bangalore")
                .latitude(12.8996)
                .longitude(77.5996)
                .totalRows(5)
                .seatsPerRow(6)
                .screenType(ScreenType.IMAX)
                .build();

        MvcResult theaterResult = mockMvc.perform(post("/api/admin/theaters")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(theaterReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("PVR Vega City"))
                .andExpect(jsonPath("$.data.capacity").value(30))
                .andReturn();

        Long theaterId = objectMapper.readTree(theaterResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // 3. Create Showtime (and check auto-generated seats = 5 * 6 = 30)
        CreateShowtimeRequest showtimeReq = CreateShowtimeRequest.builder()
                .movieId(movieId)
                .theaterId(theaterId)
                .showDate(LocalDate.now().plusDays(2))
                .showTime(LocalTime.of(20, 15))
                .price(new BigDecimal("420.00"))
                .build();

        MvcResult showtimeResult = mockMvc.perform(post("/api/admin/showtimes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(showtimeReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalSeats").value(30))
                .andExpect(jsonPath("$.data.movieTitle").value("The Matrix Resurrections"))
                .andExpect(jsonPath("$.data.theaterName").value("PVR Vega City"))
                .andReturn();

        Long showtimeId = objectMapper.readTree(showtimeResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // 4. Query All Showtimes
        mockMvc.perform(get("/api/admin/showtimes")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 5. Query Specific Showtime
        mockMvc.perform(get("/api/admin/showtimes/" + showtimeId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(showtimeId))
                .andExpect(jsonPath("$.data.totalSeats").value(30));

        // 6. Delete Showtime
        mockMvc.perform(delete("/api/admin/showtimes/" + showtimeId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
