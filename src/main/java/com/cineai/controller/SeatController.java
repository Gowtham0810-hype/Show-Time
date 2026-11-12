package com.cineai.controller;

import com.cineai.model.dto.request.HoldSeatsRequest;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.dto.response.SeatMapResponse;
import com.cineai.security.UserPrincipal;
import com.cineai.service.SeatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/showtimes/{id}/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SeatMapResponse>> getSeatMap(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : null;
        SeatMapResponse seatMap = seatService.getSeatMap(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Seat map retrieved successfully", seatMap));
    }

    @PostMapping("/hold")
    public ResponseEntity<ApiResponse<String>> holdSeats(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody HoldSeatsRequest request) {
        seatService.holdSeats(id, request.getSeatIds(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Seats successfully held for 5 minutes", "HELD"));
    }

    @DeleteMapping("/hold")
    public ResponseEntity<ApiResponse<Void>> releaseSeats(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody HoldSeatsRequest request) {
        seatService.releaseSeats(id, request.getSeatIds(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Held seats released successfully", null));
    }
}
