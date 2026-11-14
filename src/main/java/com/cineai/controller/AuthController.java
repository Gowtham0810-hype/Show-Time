package com.cineai.controller;

import com.cineai.model.dto.request.LoginRequest;
import com.cineai.model.dto.request.RegisterRequest;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.dto.response.AuthResponse;
import com.cineai.model.dto.response.UserDto;
import com.cineai.security.UserPrincipal;
import com.cineai.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        // SECURITY: Never allow public registration to set ADMIN or any elevated role
        request.setRole(com.cineai.model.enums.UserRole.USER);
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }
        UserDto user = authService.getCurrentUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Current user profile", user));
    }
}
