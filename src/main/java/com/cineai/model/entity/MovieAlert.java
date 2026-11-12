package com.cineai.model.entity;

import com.cineai.model.enums.AlertStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "movie_alerts", indexes = {
    @Index(name = "idx_movie_alerts_status", columnList = "status"),
    @Index(name = "idx_movie_alerts_movie_title", columnList = "movie_title")
})
public class MovieAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "movie_title", nullable = false)
    private String movieTitle;

    @Column(name = "theater_name")
    private String theaterName;

    @Column(length = 100)
    private String city;

    @Column(name = "screen_type", length = 50)
    private String screenType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status = AlertStatus.ACTIVE;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public MovieAlert() {}

    public MovieAlert(Long id, User user, String movieTitle, String theaterName, String city,
                      String screenType, AlertStatus status, LocalDateTime notifiedAt, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.movieTitle = movieTitle;
        this.theaterName = theaterName;
        this.city = city;
        this.screenType = screenType;
        this.status = status != null ? status : AlertStatus.ACTIVE;
        this.notifiedAt = notifiedAt;
        this.createdAt = createdAt;
    }

    public static MovieAlertBuilder builder() {
        return new MovieAlertBuilder();
    }

    public static class MovieAlertBuilder {
        private Long id;
        private User user;
        private String movieTitle;
        private String theaterName;
        private String city;
        private String screenType;
        private AlertStatus status = AlertStatus.ACTIVE;
        private LocalDateTime notifiedAt;
        private LocalDateTime createdAt;

        public MovieAlertBuilder id(Long id) { this.id = id; return this; }
        public MovieAlertBuilder user(User user) { this.user = user; return this; }
        public MovieAlertBuilder movieTitle(String movieTitle) { this.movieTitle = movieTitle; return this; }
        public MovieAlertBuilder theaterName(String theaterName) { this.theaterName = theaterName; return this; }
        public MovieAlertBuilder city(String city) { this.city = city; return this; }
        public MovieAlertBuilder screenType(String screenType) { this.screenType = screenType; return this; }
        public MovieAlertBuilder status(AlertStatus status) { this.status = status; return this; }
        public MovieAlertBuilder notifiedAt(LocalDateTime notifiedAt) { this.notifiedAt = notifiedAt; return this; }
        public MovieAlertBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public MovieAlert build() {
            return new MovieAlert(id, user, movieTitle, theaterName, city, screenType, status, notifiedAt, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getScreenType() { return screenType; }
    public void setScreenType(String screenType) { this.screenType = screenType; }
    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }
    public LocalDateTime getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(LocalDateTime notifiedAt) { this.notifiedAt = notifiedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
