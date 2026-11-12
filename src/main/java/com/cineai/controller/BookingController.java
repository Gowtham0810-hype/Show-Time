package com.cineai.controller;

import com.cineai.exception.BadRequestException;
import com.cineai.model.dto.request.BookingRequest;
import com.cineai.model.dto.response.ApiResponse;
import com.cineai.model.dto.response.BookingResponse;
import com.cineai.model.enums.UserRole;
import com.cineai.repository.UserRepository;
import com.cineai.security.UserPrincipal;
import com.cineai.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    public BookingController(BookingService bookingService,
                             UserRepository userRepository,
                             StringRedisTemplate redisTemplate) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
    }

    /** POST /api/bookings — requires authentication */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody BookingRequest request) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to create a booking"));
        }

        Long userId = currentUser.getId();

        // If holdToken provided, resolve showtime and seats from Redis
        if (request.getHoldToken() != null && !request.getHoldToken().isBlank()) {
            String redisVal = redisTemplate.opsForValue().get("hold_token:" + request.getHoldToken());
            if (redisVal != null) {
                String[] parts = redisVal.split(":");
                if (parts.length >= 3) {
                    Long showtimeId = Long.parseLong(parts[0]);
                    List<Long> seatIds = Arrays.stream(parts[2].split(","))
                            .map(Long::parseLong)
                            .collect(Collectors.toList());
                    request.setShowtimeId(showtimeId);
                    request.setSeatIds(seatIds);
                }
            }
        }

        if (request.getShowtimeId() == null || request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BadRequestException("Invalid booking request: missing showtime or seat selection");
        }

        BookingResponse booking = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking confirmed successfully", booking));
    }

    /** GET /api/bookings — returns bookings for the authenticated user */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to view bookings"));
        }

        List<BookingResponse> bookings = bookingService.getUserBookings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /** GET /api/bookings/my — alias for authenticated user bookings */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return getBookings(currentUser);
    }

    /** GET /api/bookings/{ref} — view a specific booking (public for ticket view by reference) */
    @GetMapping("/{ref}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByRef(
            @PathVariable String ref,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        // Allow unauthenticated read for ticket display — service handles ownership check
        Long uid = currentUser != null ? currentUser.getId() : null;
        boolean isAdmin = currentUser != null && currentUser.getRole() == UserRole.ADMIN;
        BookingResponse booking = bookingService.getBookingByRef(ref, uid, isAdmin || uid == null);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", booking));
    }

    /** DELETE /api/bookings/{ref} — requires authentication */
    @DeleteMapping("/{ref}")
    public ResponseEntity<ApiResponse<BookingResponse>> deleteBooking(
            @PathVariable String ref,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to cancel a booking"));
        }

        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        BookingResponse booking = bookingService.cancelBooking(ref, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    /** POST /api/bookings/{ref}/cancel — alias for DELETE */
    @PostMapping("/{ref}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable String ref,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return deleteBooking(ref, currentUser);
    }
}
