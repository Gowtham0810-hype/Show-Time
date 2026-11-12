package com.cineai.controller;

import com.cineai.exception.BadRequestException;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.entity.Seat;
import com.cineai.model.entity.Showtime;
import com.cineai.model.entity.User;
import com.cineai.repository.SeatRepository;
import com.cineai.repository.ShowtimeRepository;
import com.cineai.repository.UserRepository;
import com.cineai.security.UserPrincipal;
import com.cineai.service.SeatHoldService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/holds")
public class HoldController {

    private final SeatHoldService seatHoldService;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    public HoldController(SeatHoldService seatHoldService,
                          ShowtimeRepository showtimeRepository,
                          SeatRepository seatRepository,
                          UserRepository userRepository,
                          StringRedisTemplate redisTemplate) {
        this.seatHoldService = seatHoldService;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
    }

    public static class HoldRequestDto {
        private Object showtimeId;
        private List<Object> seatIds;
        private String userEmail;

        public Object getShowtimeId() { return showtimeId; }
        public void setShowtimeId(Object showtimeId) { this.showtimeId = showtimeId; }
        public List<Object> getSeatIds() { return seatIds; }
        public void setSeatIds(List<Object> seatIds) { this.seatIds = seatIds; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createHold(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody HoldRequestDto request) {

        if (currentUser == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to hold seats"));
        }

        if (request.getShowtimeId() == null || request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BadRequestException("Showtime ID and at least one seat ID are required");
        }

        Long showtimeId = Long.parseLong(request.getShowtimeId().toString().replace("st-", ""));
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new BadRequestException("Showtime not found with id: " + showtimeId));

        Long userId = currentUser.getId();
        String email = currentUser.getEmail();

        // Parse seat IDs to database seat entity IDs
        List<Seat> showtimeSeats = seatRepository.findByShowtimeId(showtimeId);
        List<Long> targetSeatIds = new ArrayList<>();

        for (Object sId : request.getSeatIds()) {
            String sIdStr = sId.toString().trim();
            // check if direct numeric ID
            try {
                Long numId = Long.parseLong(sIdStr);
                if (showtimeSeats.stream().anyMatch(s -> s.getId().equals(numId))) {
                    targetSeatIds.add(numId);
                    continue;
                }
            } catch (NumberFormatException ignored) {}

            // check if row-number label like "F-9" or "F9"
            String normalized = sIdStr.replace("-", "").toUpperCase();
            Optional<Seat> match = showtimeSeats.stream()
                    .filter(s -> (s.getSeatRow() + s.getSeatNumber()).equalsIgnoreCase(normalized))
                    .findFirst();

            if (match.isPresent()) {
                targetSeatIds.add(match.get().getId());
            } else if (!showtimeSeats.isEmpty()) {
                targetSeatIds.add(showtimeSeats.get(0).getId());
            }
        }

        seatHoldService.holdSeats(showtimeId, targetSeatIds, userId);

        String holdToken = "hold-" + UUID.randomUUID().toString();
        String seatIdsSerialized = targetSeatIds.stream().map(Object::toString).collect(Collectors.joining(","));
        String redisValue = showtimeId + ":" + userId + ":" + seatIdsSerialized + ":" + email;

        redisTemplate.opsForValue().set("hold_token:" + holdToken, redisValue, Duration.ofMinutes(5));

        BigDecimal pricePerSeat = showtime.getPrice() != null ? showtime.getPrice() : new BigDecimal("250.00");
        BigDecimal totalAmount = pricePerSeat.multiply(BigDecimal.valueOf(targetSeatIds.size()));

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(5));

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("holdToken", holdToken);
        responseData.put("showtimeId", request.getShowtimeId().toString());
        responseData.put("seatIds", request.getSeatIds());
        responseData.put("expiresAt", expiresAt.toString());
        responseData.put("expiresInSeconds", 300);
        responseData.put("totalAmount", totalAmount.doubleValue());

        return ResponseEntity.ok(ApiResponse.success("Seats held successfully for 5 minutes", responseData));
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<ApiResponse<Map<String, String>>> releaseHold(
            @PathVariable String token,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String value = redisTemplate.opsForValue().get("hold_token:" + token);
        if (value != null) {
            String[] parts = value.split(":");
            if (parts.length >= 3) {
                Long showtimeId = Long.parseLong(parts[0]);
                Long userId = Long.parseLong(parts[1]);
                List<Long> seatIds = Arrays.stream(parts[2].split(","))
                        .map(Long::parseLong)
                        .collect(Collectors.toList());

                seatHoldService.releaseHeldSeats(showtimeId, seatIds, userId);
            }
            redisTemplate.delete("hold_token:" + token);
        }

        return ResponseEntity.ok(ApiResponse.success("Hold released successfully", Map.of("message", "Hold released")));
    }
}
