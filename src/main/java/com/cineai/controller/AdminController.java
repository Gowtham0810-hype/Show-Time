package com.cineai.controller;

import com.cineai.model.dto.request.*;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.dto.response.MovieResponse;
import com.cineai.model.dto.response.ShowtimeResponse;
import com.cineai.model.dto.response.TheaterResponse;
import com.cineai.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ==========================================
    // MOVIES
    // ==========================================

    @PostMapping("/movies")
    public ResponseEntity<ApiResponse<MovieResponse>> addMovie(@Valid @RequestBody CreateMovieRequest request) {
        MovieResponse movie = adminService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Movie added successfully", movie));
    }

    @PutMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMovieRequest request) {
        MovieResponse movie = adminService.updateMovie(id, request);
        return ResponseEntity.ok(ApiResponse.success("Movie updated successfully", movie));
    }

    @GetMapping("/movies")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getAllMovies() {
        List<MovieResponse> movies = adminService.getAllMovies();
        return ResponseEntity.ok(ApiResponse.success("Movies retrieved successfully", movies));
    }

    @GetMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieById(@PathVariable Long id) {
        MovieResponse movie = adminService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success("Movie retrieved successfully", movie));
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        adminService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Movie deleted successfully", null));
    }

    // ==========================================
    // THEATERS
    // ==========================================

    @PostMapping("/theaters")
    public ResponseEntity<ApiResponse<TheaterResponse>> addTheater(@Valid @RequestBody CreateTheaterRequest request) {
        TheaterResponse theater = adminService.createTheater(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Theater added successfully", theater));
    }

    @PutMapping("/theaters/{id}")
    public ResponseEntity<ApiResponse<TheaterResponse>> updateTheater(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTheaterRequest request) {
        TheaterResponse theater = adminService.updateTheater(id, request);
        return ResponseEntity.ok(ApiResponse.success("Theater updated successfully", theater));
    }

    @GetMapping("/theaters")
    public ResponseEntity<ApiResponse<List<TheaterResponse>>> getAllTheaters() {
        List<TheaterResponse> theaters = adminService.getAllTheaters();
        return ResponseEntity.ok(ApiResponse.success("Theaters retrieved successfully", theaters));
    }

    @GetMapping("/theaters/{id}")
    public ResponseEntity<ApiResponse<TheaterResponse>> getTheaterById(@PathVariable Long id) {
        TheaterResponse theater = adminService.getTheaterById(id);
        return ResponseEntity.ok(ApiResponse.success("Theater retrieved successfully", theater));
    }

    @DeleteMapping("/theaters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTheater(@PathVariable Long id) {
        adminService.deleteTheater(id);
        return ResponseEntity.ok(ApiResponse.success("Theater deleted successfully", null));
    }

    // ==========================================
    // SHOWTIMES
    // ==========================================

    @PostMapping("/showtimes")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> addShowtime(@Valid @RequestBody CreateShowtimeRequest request) {
        ShowtimeResponse showtime = adminService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Showtime created and seats initialized successfully", showtime));
    }

    @PutMapping("/showtimes/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> updateShowtime(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShowtimeRequest request) {
        ShowtimeResponse showtime = adminService.updateShowtime(id, request);
        return ResponseEntity.ok(ApiResponse.success("Showtime updated successfully", showtime));
    }

    @GetMapping("/showtimes")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getAllShowtimes() {
        List<ShowtimeResponse> showtimes = adminService.getAllShowtimes();
        return ResponseEntity.ok(ApiResponse.success("Showtimes retrieved successfully", showtimes));
    }

    @GetMapping("/showtimes/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getShowtimeById(@PathVariable Long id) {
        ShowtimeResponse showtime = adminService.getShowtimeById(id);
        return ResponseEntity.ok(ApiResponse.success("Showtime retrieved successfully", showtime));
    }

    @DeleteMapping("/showtimes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(@PathVariable Long id) {
        adminService.deleteShowtime(id);
        return ResponseEntity.ok(ApiResponse.success("Showtime deleted successfully", null));
    }
}
