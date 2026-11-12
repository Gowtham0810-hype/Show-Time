package com.cineai.service;

import com.cineai.exception.*;
import org.springframework.security.access.AccessDeniedException;
import com.cineai.model.dto.request.BookingRequest;
import com.cineai.model.dto.response.BookingResponse;
import com.cineai.model.dto.response.BookingSummary;
import com.cineai.model.entity.*;
import com.cineai.model.enums.BookingStatus;
import com.cineai.model.enums.SeatCategory;
import com.cineai.model.enums.SeatStatus;
import com.cineai.repository.BookingRepository;
import com.cineai.repository.BookingSeatRepository;
import com.cineai.repository.SeatRepository;
import com.cineai.repository.ShowtimeRepository;
import com.cineai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final UserRepository userRepository;
    private final SeatHoldService seatHoldService;
    private final EmailService emailService;

    public BookingService(SeatRepository seatRepository,
                          BookingRepository bookingRepository,
                          BookingSeatRepository bookingSeatRepository,
                          ShowtimeRepository showtimeRepository,
                          UserRepository userRepository,
                          SeatHoldService seatHoldService,
                          EmailService emailService) {
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.showtimeRepository = showtimeRepository;
        this.userRepository = userRepository;
        this.seatHoldService = seatHoldService;
        this.emailService = emailService;
    }

    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        log.info("Initiating booking for user {} on showtime {} with seats {}",
                userId, request.getShowtimeId(), request.getSeatIds());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ShowtimeNotFoundException("Showtime not found with id: " + request.getShowtimeId()));

        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BadRequestException("At least one seat must be selected");
        }

        // Layer 2: Acquire database pessimistic write lock on selected seats
        List<Seat> seats = seatRepository.findByIdsWithLock(request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new BadRequestException("One or more seat IDs were not found");
        }

        // Validate seats belong to this showtime and availability
        for (Seat seat : seats) {
            String seatLabel = seat.getSeatRow() + seat.getSeatNumber();

            if (!seat.getShowtime().getId().equals(request.getShowtimeId())) {
                throw new BadRequestException("Seat " + seatLabel + " does not belong to this showtime");
            }

            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new SeatAlreadyBookedException("Seat " + seatLabel + " is already booked");
            }

            // If held in Redis, verify held by THIS user
            if (seatHoldService.isHeld(request.getShowtimeId(), seat.getId())) {
                if (!seatHoldService.isHeldByUser(request.getShowtimeId(), seat.getId(), userId)) {
                    throw new SeatAlreadyHeldException("Seat " + seatLabel + " is held by another user");
                }
            }
        }

        // Mark seats as BOOKED in DB
        for (Seat seat : seats) {
            seat.setStatus(SeatStatus.BOOKED);
        }
        seatRepository.saveAll(seats);

        // Calculate total amount
        BigDecimal totalAmount = calculateTotal(seats, showtime.getPrice());

        // Create booking record
        Booking booking = Booking.builder()
                .user(user)
                .showtime(showtime)
                .bookingRef(generateBookingRef())
                .totalAmount(totalAmount)
                .status(BookingStatus.CONFIRMED)
                .bookedAt(LocalDateTime.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Create join table entries
        List<BookingSeat> bookingSeats = new ArrayList<>();
        for (Seat seat : seats) {
            BookingSeat bs = BookingSeat.builder()
                    .booking(savedBooking)
                    .seat(seat)
                    .build();
            bookingSeats.add(bs);
        }
        bookingSeatRepository.saveAll(bookingSeats);
        savedBooking.setBookingSeats(bookingSeats);

        // Clear temporary Redis holds
        seatHoldService.releaseHeldSeats(request.getShowtimeId(), request.getSeatIds(), userId);

        // Send confirmation email asynchronously
        emailService.sendBookingConfirmation(userId, savedBooking, seats);

        log.info("Booking confirmed with ref: {} for user: {}", savedBooking.getBookingRef(), user.getEmail());
        return BookingResponse.from(savedBooking, seats);
    }

    @Transactional(readOnly = true)
    public BookingSummary buildSummary(Long showtimeId, List<Long> seatIds) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ShowtimeNotFoundException("Showtime not found with id: " + showtimeId));

        List<Seat> seats = seatRepository.findAllById(seatIds);
        BigDecimal total = calculateTotal(seats, showtime.getPrice());

        List<String> labels = seats.stream()
                .map(s -> s.getSeatRow() + s.getSeatNumber())
                .collect(Collectors.toList());

        return BookingSummary.builder()
                .showtimeId(showtime.getId())
                .movieTitle(showtime.getMovie() != null ? showtime.getMovie().getTitle() : null)
                .theaterName(showtime.getTheater() != null ? showtime.getTheater().getName() : null)
                .screenType(showtime.getTheater() != null && showtime.getTheater().getScreenType() != null ? showtime.getTheater().getScreenType().getValue() : null)
                .showDate(showtime.getShowDate())
                .showTime(showtime.getShowTime())
                .seatLabels(labels)
                .seatIds(seatIds)
                .totalAmount(total)
                .build();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookedAtDesc(userId);
        return bookings.stream()
                .map(b -> BookingResponse.from(b, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByRef(String bookingRef, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with reference: " + bookingRef));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to view this booking");
        }

        return BookingResponse.from(booking, null);
    }

    @Transactional
    public BookingResponse cancelBooking(String bookingRef, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with reference: " + bookingRef));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        // Release seats back to AVAILABLE
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());
        List<Seat> seatsToRelease = new ArrayList<>();
        for (BookingSeat bs : bookingSeats) {
            Seat seat = bs.getSeat();
            if (seat != null) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seatsToRelease.add(seat);
            }
        }
        seatRepository.saveAll(seatsToRelease);

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Booking {} successfully cancelled by user {}", bookingRef, userId);
        return BookingResponse.from(updatedBooking, seatsToRelease);
    }

    public BigDecimal calculateTotal(List<Seat> seats, BigDecimal basePrice) {
        if (seats == null || seats.isEmpty() || basePrice == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;
        for (Seat seat : seats) {
            BigDecimal multiplier = BigDecimal.ONE;
            if (seat.getSeatCategory() == SeatCategory.VIP) {
                multiplier = new BigDecimal("1.50");
            } else if (seat.getSeatCategory() == SeatCategory.PREMIUM) {
                multiplier = new BigDecimal("1.25");
            }
            total = total.add(basePrice.multiply(multiplier));
        }

        return total.setScale(2, RoundingMode.HALF_UP);
    }

    public String generateBookingRef() {
        String ref;
        do {
            StringBuilder sb = new StringBuilder("BK-");
            for (int i = 0; i < 6; i++) {
                sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
            }
            ref = sb.toString();
        } while (bookingRepository.existsByBookingRef(ref));

        return ref;
    }

    @Transactional(readOnly = true)
    public BookingResponse getLatestUserBooking(Long userId) {
        List<Booking> userBookings = bookingRepository.findByUserIdOrderByBookedAtDesc(userId);
        if (userBookings.isEmpty()) {
            return null;
        }
        Booking latest = userBookings.get(0);
        List<BookingSeat> bSeats = bookingSeatRepository.findByBookingId(latest.getId());
        List<Seat> seats = bSeats.stream().map(BookingSeat::getSeat).collect(Collectors.toList());
        return BookingResponse.from(latest, seats);
    }
}
