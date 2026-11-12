package com.cineai.service;

import com.cineai.model.entity.Booking;
import com.cineai.model.entity.MovieAlert;
import com.cineai.model.entity.Seat;
import com.cineai.model.entity.Showtime;
import com.cineai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${spring.mail.username:noreply@cineai.com}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender, UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    public void sendBookingConfirmation(Long userId, Booking booking, List<Seat> seats) {
        userRepository.findById(userId).ifPresent(user -> {
            try {
                String seatNames = seats.stream()
                        .map(s -> s.getSeatRow() + s.getSeatNumber())
                        .collect(Collectors.joining(", "));

                String movieTitle = booking.getShowtime() != null && booking.getShowtime().getMovie() != null
                        ? booking.getShowtime().getMovie().getTitle()
                        : "Movie";

                String theaterName = booking.getShowtime() != null && booking.getShowtime().getTheater() != null
                        ? booking.getShowtime().getTheater().getName()
                        : "Theater";

                String showDate = (booking.getShowtime() != null && booking.getShowtime().getShowDate() != null)
                        ? booking.getShowtime().getShowDate().toString() : "";

                String showTime = (booking.getShowtime() != null && booking.getShowtime().getShowTime() != null)
                        ? booking.getShowtime().getShowTime().toString() : "";

                String totalAmount = (booking.getTotalAmount() != null)
                        ? booking.getTotalAmount().toString() : "0.00";

                log.info("[EMAIL] Dispatching booking confirmation for ref={} to user={} email={}",
                        booking.getBookingRef(), userId, user.getEmail());

                dispatchBookingEmail(
                        user.getEmail(),
                        user.getFullName(),
                        booking.getBookingRef(),
                        movieTitle,
                        theaterName,
                        showDate,
                        showTime,
                        seatNames,
                        totalAmount
                );
            } catch (Exception e) {
                log.error("[EMAIL] Error preparing booking confirmation email for userId={}: {}", userId, e.getMessage(), e);
            }
        });
    }

    @Async("taskExecutor")
    public void dispatchBookingEmail(String email, String fullName, String bookingRef, String movieTitle,
                                     String theaterName, String showDate, String showTime,
                                     String seatNames, String totalAmount) {
        log.info("[EMAIL] Attempting to send booking confirmation to={} ref={} via SMTP from={}", email, bookingRef, fromAddress);
        try {
            String text = String.format(
                    "Dear %s,\n\nYour booking is confirmed! 🎉\n\n" +
                            "Booking Reference: %s\n" +
                            "Movie: %s\n" +
                            "Theater: %s\n" +
                            "Show Date: %s\n" +
                            "Show Time: %s\n" +
                            "Seats: %s\n" +
                            "Total Amount: ₹%s\n\n" +
                            "Enjoy your movie!\nCineAI Team",
                    fullName, bookingRef, movieTitle, theaterName, showDate, showTime, seatNames, totalAmount
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject("Booking Confirmed: " + bookingRef + " (" + movieTitle + ")");
            message.setText(text);

            mailSender.send(message);
            log.info("[EMAIL] ✅ Booking confirmation sent to {} for booking {}", email, bookingRef);
        } catch (Exception e) {
            log.error("[EMAIL] ❌ Failed to send booking confirmation to {} — {}", email, e.getMessage(), e);
        }
    }

    public void sendAlertNotification(MovieAlert alert, List<Showtime> matchingShowtimes) {
        String recipientEmail = (alert.getUser() != null) ? alert.getUser().getEmail() : null;
        if (recipientEmail == null) {
            log.warn("[EMAIL] Alert notification skipped — no user email on alert id={}", alert.getId());
            return;
        }

        String showtimeDetails = matchingShowtimes.stream()
                .map(s -> String.format("- %s at %s (%s %s) - ₹%s",
                        s.getMovie() != null ? s.getMovie().getTitle() : "Movie",
                        s.getTheater() != null ? s.getTheater().getName() : "Theater",
                        s.getShowDate(),
                        s.getShowTime(),
                        s.getPrice()))
                .collect(Collectors.joining("\n"));

        log.info("[EMAIL] Dispatching alert notification for movie='{}' to={}", alert.getMovieTitle(), recipientEmail);
        sendAlertNotification(recipientEmail, alert.getMovieTitle(), showtimeDetails);
    }

    @Async("taskExecutor")
    public void sendAlertNotification(String recipientEmail, String movieTitle, String showtimeDetails) {
        log.info("[EMAIL] Attempting to send alert notification to={} movie='{}'", recipientEmail, movieTitle);
        try {
            String text = String.format(
                    "Hello,\n\nExciting news! Showtimes have opened for '%s':\n\n%s\n\n" +
                            "Book now via CineAI!\n\nBest,\nCineAI Team",
                    movieTitle, showtimeDetails
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(recipientEmail);
            message.setSubject("Movie Alert: " + movieTitle + " is now open for booking!");
            message.setText(text);

            mailSender.send(message);
            log.info("[EMAIL] ✅ Alert notification sent to {}", recipientEmail);
        } catch (Exception e) {
            log.error("[EMAIL] ❌ Failed to send alert notification to {} — {}", recipientEmail, e.getMessage(), e);
        }
    }
}
