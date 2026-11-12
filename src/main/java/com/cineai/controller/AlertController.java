package com.cineai.controller;

import com.cineai.model.dto.request.CreateAlertRequest;
import com.cineai.model.dto.response.AlertResponse;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.repository.UserRepository;
import com.cineai.security.UserPrincipal;
import com.cineai.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;
    private final UserRepository userRepository;

    public AlertController(AlertService alertService, UserRepository userRepository) {
        this.alertService = alertService;
        this.userRepository = userRepository;
    }

    /** POST /api/alerts — requires authentication */
    @PostMapping
    public ResponseEntity<ApiResponse<AlertResponse>> createAlert(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateAlertRequest request) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to set an alert"));
        }

        AlertResponse alert = alertService.createAlert(
                currentUser.getId(),
                request.getMovieTitle(),
                request.getTheaterName(),
                request.getCity(),
                request.getScreenType()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Alert created successfully", alert));
    }

    /** GET /api/alerts — returns alerts for authenticated user, or by email param */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts(
            @RequestParam(required = false) String email,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Long userId = null;
        if (currentUser != null) {
            userId = currentUser.getId();
        } else if (email != null && !email.isBlank()) {
            Optional<com.cineai.model.entity.User> u = userRepository.findByEmail(email.trim());
            if (u.isPresent()) {
                userId = u.get().getId();
            }
        }

        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.success("Active alerts retrieved", List.of()));
        }

        List<AlertResponse> alerts = alertService.getUserAlerts(userId);
        return ResponseEntity.ok(ApiResponse.success("Active alerts retrieved", alerts));
    }

    /** GET /api/alerts/my — authenticated alias */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getMyAlerts(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        List<AlertResponse> alerts = alertService.getUserAlerts(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Active alerts retrieved", alerts));
    }

    /** DELETE /api/alerts/{id} — requires authentication */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertResponse>> cancelAlert(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to cancel an alert"));
        }

        AlertResponse alert = alertService.cancelAlert(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Alert cancelled successfully", alert));
    }
}
