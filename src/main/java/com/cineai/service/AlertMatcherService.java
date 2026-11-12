package com.cineai.service;

import com.cineai.model.entity.AlertNotification;
import com.cineai.model.entity.MovieAlert;
import com.cineai.model.entity.Showtime;
import com.cineai.model.enums.AlertStatus;
import com.cineai.model.enums.NotificationChannel;
import com.cineai.model.enums.ShowtimeStatus;
import com.cineai.repository.AlertNotificationRepository;
import com.cineai.repository.MovieAlertRepository;
import com.cineai.repository.ShowtimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AlertMatcherService {

    private static final Logger log = LoggerFactory.getLogger(AlertMatcherService.class);

    private final MovieAlertRepository alertRepository;
    private final ShowtimeRepository showtimeRepository;
    private final AlertNotificationRepository notificationRepository;
    private final EmailService emailService;

    public AlertMatcherService(MovieAlertRepository alertRepository,
                               ShowtimeRepository showtimeRepository,
                               AlertNotificationRepository notificationRepository,
                               EmailService emailService) {
        this.alertRepository = alertRepository;
        this.showtimeRepository = showtimeRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @Transactional
    public int matchAlerts() {
        List<MovieAlert> activeAlerts = alertRepository.findByStatus(AlertStatus.ACTIVE);
        if (activeAlerts.isEmpty()) {
            return 0;
        }

        List<Showtime> activeShowtimes = showtimeRepository.findByStatus(ShowtimeStatus.ACTIVE);
        if (activeShowtimes.isEmpty()) {
            return 0;
        }

        log.info("Running alert matcher for {} active alerts against {} active showtimes",
                activeAlerts.size(), activeShowtimes.size());
        int triggeredCount = 0;

        for (MovieAlert alert : activeAlerts) {
            List<Showtime> matches = new ArrayList<>();
            for (Showtime st : activeShowtimes) {
                // Must be created on or after alert creation
                if (st.getCreatedAt() != null && alert.getCreatedAt() != null
                        && st.getCreatedAt().isBefore(alert.getCreatedAt())) {
                    continue;
                }
                if (isMatch(alert, st)) {
                    matches.add(st);
                }
            }

            if (!matches.isEmpty()) {
                triggerAlert(alert, matches);
                triggeredCount++;
            }
        }

        log.info("Alert matcher completed. Triggered {} alerts", triggeredCount);
        return triggeredCount;
    }

    @Transactional
    public void checkAlertsForShowtime(Showtime showtime) {
        if (showtime == null || showtime.getStatus() != ShowtimeStatus.ACTIVE) {
            return;
        }

        List<MovieAlert> activeAlerts = alertRepository.findByStatus(AlertStatus.ACTIVE);
        for (MovieAlert alert : activeAlerts) {
            if (isMatch(alert, showtime)) {
                triggerAlert(alert, List.of(showtime));
            }
        }
    }

    @Transactional
    public void triggerAlert(MovieAlert alert, List<Showtime> matchingShowtimes) {
        // 1. Dispatch email notification asynchronously
        emailService.sendAlertNotification(alert, matchingShowtimes);

        // 2. Persist notification log records (EMAIL and IN_APP)
        List<AlertNotification> notifications = new ArrayList<>();
        for (Showtime st : matchingShowtimes) {
            notifications.add(AlertNotification.builder()
                    .alert(alert)
                    .showtime(st)
                    .channel(NotificationChannel.EMAIL)
                    .build());

            notifications.add(AlertNotification.builder()
                    .alert(alert)
                    .showtime(st)
                    .channel(NotificationChannel.IN_APP)
                    .build());
        }
        notificationRepository.saveAll(notifications);

        // 3. Mark alert as TRIGGERED
        alert.setStatus(AlertStatus.TRIGGERED);
        alert.setNotifiedAt(LocalDateTime.now());
        alertRepository.save(alert);

        log.info("Alert {} triggered for user {} - movie: {}",
                alert.getId(), alert.getUser().getId(), alert.getMovieTitle());
    }

    private boolean isMatch(MovieAlert alert, Showtime showtime) {
        String movieTitle = (showtime.getMovie() != null) ? showtime.getMovie().getTitle().toLowerCase() : "";
        String alertMovie = alert.getMovieTitle().trim().toLowerCase();

        if (!movieTitle.contains(alertMovie) && !alertMovie.contains(movieTitle)) {
            return false;
        }

        if (alert.getTheaterName() != null && !alert.getTheaterName().isBlank()) {
            String theaterName = (showtime.getTheater() != null) ? showtime.getTheater().getName().toLowerCase() : "";
            String alertTheater = alert.getTheaterName().trim().toLowerCase();
            if (!theaterName.contains(alertTheater)) {
                return false;
            }
        }

        if (alert.getCity() != null && !alert.getCity().isBlank()) {
            String city = (showtime.getTheater() != null) ? showtime.getTheater().getCity().toLowerCase() : "";
            String alertCity = alert.getCity().trim().toLowerCase();
            if (!city.equalsIgnoreCase(alertCity)) {
                return false;
            }
        }

        return true;
    }
}
