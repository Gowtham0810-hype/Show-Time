package com.cineai.controller;

import com.cineai.model.dto.request.CreateShowtimeRequest;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.dto.response.ShowtimeResponse;
import com.cineai.service.AdminService;
import com.cineai.service.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowtimeService showtimeService;
    private final AdminService adminService;

    public ShowtimeController(ShowtimeService showtimeService, AdminService adminService) {
        this.showtimeService = showtimeService;
        this.adminService = adminService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getShowtimeById(@PathVariable Long id) {
        ShowtimeResponse showtime = showtimeService.getShowtimeById(id);
        return ResponseEntity.ok(ApiResponse.success("Showtime details retrieved successfully", showtime));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> queryShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long theatreId,
            @RequestParam(required = false) Long theaterId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String city) {
        Long targetTheaterId = theatreId != null ? theatreId : theaterId;
        List<ShowtimeResponse> showtimes = showtimeService.queryShowtimes(movieId, date, city);
        if (targetTheaterId != null) {
            showtimes = showtimes.stream()
                    .filter(s -> s.getTheaterId() != null && s.getTheaterId().equals(targetTheaterId))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(ApiResponse.success("Showtimes query results retrieved successfully", showtimes));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> createShowtime(@Valid @RequestBody CreateShowtimeRequest request) {
        ShowtimeResponse created = adminService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Showtime created successfully", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(@PathVariable Long id) {
        adminService.deleteShowtime(id);
        return ResponseEntity.ok(ApiResponse.success("Showtime deleted successfully", null));
    }
}
