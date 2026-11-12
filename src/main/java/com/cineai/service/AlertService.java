package com.cineai.service;

import com.cineai.exception.BadRequestException;
import com.cineai.exception.ResourceNotFoundException;
import com.cineai.model.dto.response.AlertResponse;
import com.cineai.model.dto.response.NotificationResponse;
import com.cineai.model.entity.MovieAlert;
import com.cineai.model.entity.User;
import com.cineai.model.enums.AlertStatus;
import com.cineai.repository.AlertNotificationRepository;
import com.cineai.repository.MovieAlertRepository;
import com.cineai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final MovieAlertRepository alertRepository;
    private final AlertNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public AlertService(MovieAlertRepository alertRepository,
                        AlertNotificationRepository notificationRepository,
                        UserRepository userRepository) {
        this.alertRepository = alertRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AlertResponse createAlert(Long userId, String movieTitle, String theaterName, String city, String screenType) {
        if (movieTitle == null || movieTitle.isBlank()) {
            throw new BadRequestException("Movie title is required to create an alert");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String cleanTitle = movieTitle.trim();
        String cleanTheater = (theaterName != null && !theaterName.isBlank() && !"Any Theatre".equalsIgnoreCase(theaterName)) ? theaterName.trim() : null;
        List<MovieAlert> existingAlerts = alertRepository.findByUserIdAndStatus(userId, AlertStatus.ACTIVE);
        for (MovieAlert ma : existingAlerts) {
            if (ma.getMovieTitle() != null && ma.getMovieTitle().equalsIgnoreCase(cleanTitle)) {
                boolean sameTheater = (cleanTheater == null && (ma.getTheaterName() == null || ma.getTheaterName().isBlank()))
                        || (cleanTheater != null && cleanTheater.equalsIgnoreCase(ma.getTheaterName()));
                if (sameTheater) {
                    log.info("Active alert id {} already exists for user {} on movie '{}' at theater '{}'", ma.getId(), userId, cleanTitle, cleanTheater);
                    return AlertResponse.fromEntity(ma);
                }
            }
        }

        MovieAlert alert = MovieAlert.builder()
                .user(user)
                .movieTitle(cleanTitle)
                .theaterName(cleanTheater)
                .city(city != null && !city.isBlank() ? city.trim() : null)
                .screenType(screenType != null && !screenType.isBlank() ? screenType.trim().toUpperCase() : null)
                .status(AlertStatus.ACTIVE)
                .build();

        MovieAlert saved = alertRepository.save(alert);
        log.info("Created alert id {} for user {} on movie '{}'", saved.getId(), userId, saved.getMovieTitle());
        return AlertResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getUserAlerts(Long userId) {
        return alertRepository.findByUserIdAndStatus(userId, AlertStatus.ACTIVE).stream()
                .map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertResponse cancelAlert(Long userId, Long alertId) {
        MovieAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));

        if (!alert.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to cancel this alert");
        }

        alert.setStatus(AlertStatus.CANCELLED);
        MovieAlert saved = alertRepository.save(alert);
        log.info("Alert id {} cancelled by user {}", alertId, userId);
        return AlertResponse.fromEntity(saved);
    }

    @Transactional
    public List<AlertResponse> cancelAlertByMovie(Long userId, String movieTitle) {
        if (movieTitle == null || movieTitle.isBlank()) {
            return List.of();
        }
        String cleanTitle = movieTitle.trim().toLowerCase();
        List<MovieAlert> userAlerts = alertRepository.findByUserIdAndStatus(userId, AlertStatus.ACTIVE);
        List<AlertResponse> cancelled = new ArrayList<>();

        for (MovieAlert alert : userAlerts) {
            if (alert.getMovieTitle().toLowerCase().contains(cleanTitle)) {
                alert.setStatus(AlertStatus.CANCELLED);
                alertRepository.save(alert);
                cancelled.add(AlertResponse.fromEntity(alert));
            }
        }
        return cancelled;
    }
}
