package com.cineai.controller;

import com.cineai.model.dto.request.BookingRequest;
import com.cineai.model.dto.request.HoldSeatsRequest;
import com.cineai.model.dto.request.RegisterRequest;
import com.cineai.model.dto.response.AuthResponse;
import com.cineai.model.entity.Seat;
import com.cineai.model.enums.SeatStatus;
import com.cineai.model.enums.UserRole;
import com.cineai.repository.SeatRepository;
import com.cineai.service.AuthService;
import com.cineai.service.SeatHoldService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SeatAndBookingConcurrencyTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private SeatHoldService seatHoldService;

    @Autowired
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    private String userTokenA;
    private String userTokenB;

    @BeforeEach
    void setUp() {
        var keys = redisTemplate.keys("seat_hold:*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }

        List<Seat> seats = seatRepository.findAll();
        for (Seat s : seats) {
            if (s.getStatus() != SeatStatus.AVAILABLE) {
                s.setStatus(SeatStatus.AVAILABLE);
                seatRepository.save(s);
            }
        }

        String emailA = "alice_" + System.currentTimeMillis() + "@cineai.com";
        AuthResponse authA = authService.register(RegisterRequest.builder()
                .email(emailA)
                .password("password123")
                .fullName("Alice")
                .role(UserRole.USER)
                .build());
        this.userTokenA = authA.getToken();

        String emailB = "bob_" + System.currentTimeMillis() + "@cineai.com";
        AuthResponse authB = authService.register(RegisterRequest.builder()
                .email(emailB)
                .password("password123")
                .fullName("Bob")
                .role(UserRole.USER)
                .build());
        this.userTokenB = authB.getToken();
    }

    @Test
    void shouldRetrieveSeatMapForShowtime() throws Exception {
        mockMvc.perform(get("/api/showtimes/1/seats")
                        .header("Authorization", "Bearer " + userTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.showtimeId").value(1))
                .andExpect(jsonPath("$.data.seats", hasSize(greaterThan(0))));
    }

    @Test
    void shouldPreventSeatHoldCollisionAndAllowRelease() throws Exception {
        Long showtimeId = 1L;
        List<Seat> showtimeSeats = seatRepository.findByShowtimeId(showtimeId);
        Long seatId = showtimeSeats.get(0).getId();

        // 1. User A holds seat
        HoldSeatsRequest holdReq = HoldSeatsRequest.builder()
                .seatIds(List.of(seatId))
                .build();

        mockMvc.perform(post("/api/showtimes/" + showtimeId + "/seats/hold")
                        .header("Authorization", "Bearer " + userTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("HELD"));

        // 2. User B tries to hold the same seat -> Conflict 409
        mockMvc.perform(post("/api/showtimes/" + showtimeId + "/seats/hold")
                        .header("Authorization", "Bearer " + userTokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Seat Already Held"));

        // 3. User A releases the seat
        mockMvc.perform(delete("/api/showtimes/" + showtimeId + "/seats/hold")
                        .header("Authorization", "Bearer " + userTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isOk());

        // 4. Now User B can successfully hold the seat
        mockMvc.perform(post("/api/showtimes/" + showtimeId + "/seats/hold")
                        .header("Authorization", "Bearer " + userTokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("HELD"));
    }

    @Test
    void shouldEnforceConcurrencyLockingDuringFinalBookingAndAllowCancellation() throws Exception {
        Long showtimeId = 2L;
        List<Seat> showtimeSeats = seatRepository.findByShowtimeId(showtimeId);
        Long seatId = showtimeSeats.get(10).getId();

        // 1. User A holds seat
        HoldSeatsRequest holdReq = HoldSeatsRequest.builder().seatIds(List.of(seatId)).build();
        mockMvc.perform(post("/api/showtimes/" + showtimeId + "/seats/hold")
                        .header("Authorization", "Bearer " + userTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isOk());

        // 2. User A confirms final booking with pessimistic locking
        BookingRequest bookingReq = BookingRequest.builder()
                .showtimeId(showtimeId)
                .seatIds(List.of(seatId))
                .build();

        MvcResult bookingResult = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + userTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingRef").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andReturn();

        String bookingRef = objectMapper.readTree(bookingResult.getResponse().getContentAsString())
                .get("data").get("bookingRef").asText();

        // 3. Verify seat is marked BOOKED in database
        Seat bookedSeat = seatRepository.findById(seatId).orElseThrow();
        assertEquals(SeatStatus.BOOKED, bookedSeat.getStatus());

        // 4. User B attempts to book the same seat -> Rejected 409 Conflict (Pessimistic lock & DB state protection)
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + userTokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Seat Already Booked"));

        // 5. User A can view their bookings via My Bookings
        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", "Bearer " + userTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].bookingRef").value(bookingRef));

        // 6. User A views booking details
        mockMvc.perform(get("/api/bookings/" + bookingRef)
                        .header("Authorization", "Bearer " + userTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingRef").value(bookingRef));

        // 7. User A cancels booking -> seat is released back to AVAILABLE
        mockMvc.perform(post("/api/bookings/" + bookingRef + "/cancel")
                        .header("Authorization", "Bearer " + userTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        Seat releasedSeat = seatRepository.findById(seatId).orElseThrow();
        assertEquals(SeatStatus.AVAILABLE, releasedSeat.getStatus());
    }
}
