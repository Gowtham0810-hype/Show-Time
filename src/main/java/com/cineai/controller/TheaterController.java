package com.cineai.controller;

import com.cineai.model.dto.request.CreateTheaterRequest;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.dto.response.TheaterResponse;
import com.cineai.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/theaters", "/api/theatres"})
public class TheaterController {

    private final AdminService adminService;

    public TheaterController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TheaterResponse>>> getAllTheaters() {
        List<TheaterResponse> theaters = adminService.getAllTheaters();
        return ResponseEntity.ok(ApiResponse.success("Theaters retrieved successfully", theaters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterResponse>> getTheaterById(@PathVariable Long id) {
        TheaterResponse theater = adminService.getTheaterById(id);
        return ResponseEntity.ok(ApiResponse.success("Theater retrieved successfully", theater));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheaterResponse>> createTheater(@Valid @RequestBody CreateTheaterRequest request) {
        TheaterResponse created = adminService.createTheater(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Theater created successfully", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTheater(@PathVariable Long id) {
        adminService.deleteTheater(id);
        return ResponseEntity.ok(ApiResponse.success("Theater deleted successfully", null));
    }
}
