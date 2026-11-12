package com.cineai.controller;

import com.cineai.model.dto.request.CreateMovieRequest;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.dto.response.MovieResponse;
import com.cineai.model.dto.response.ShowtimeResponse;
import com.cineai.model.enums.MovieStatus;
import com.cineai.service.AdminService;
import com.cineai.service.MovieService;
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
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;
    private final AdminService adminService;

    public MovieController(MovieService movieService, AdminService adminService) {
        this.movieService = movieService;
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getMovies(
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Boolean showing,
            @RequestParam(required = false) Boolean upcoming) {

        MovieStatus effectiveStatus = status;
        if (effectiveStatus == null) {
            if (Boolean.TRUE.equals(showing)) {
                effectiveStatus = MovieStatus.NOW_SHOWING;
            } else if (Boolean.TRUE.equals(upcoming)) {
                effectiveStatus = MovieStatus.UPCOMING;
            }
        }

        List<MovieResponse> movies = movieService.getMovies(effectiveStatus, genre, search);

        if (language != null && !language.isBlank()) {
            movies = movies.stream()
                    .filter(m -> m.getLanguage() != null && m.getLanguage().equalsIgnoreCase(language.trim()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Movies retrieved successfully", movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieById(@PathVariable Long id) {
        MovieResponse movie = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success("Movie details retrieved successfully", movie));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(@Valid @RequestBody CreateMovieRequest request) {
        MovieResponse created = adminService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Movie created successfully", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        adminService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Movie deleted successfully", null));
    }

    @GetMapping("/{id}/showtimes")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getMovieShowtimes(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ShowtimeResponse> showtimes = movieService.getMovieShowtimes(id, date);
        return ResponseEntity.ok(ApiResponse.success("Showtimes retrieved successfully", showtimes));
    }
}
