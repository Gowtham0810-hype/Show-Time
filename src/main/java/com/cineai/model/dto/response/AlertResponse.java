package com.cineai.model.dto.response;

import com.cineai.model.entity.MovieAlert;
import com.cineai.model.enums.AlertStatus;

import java.time.LocalDateTime;

public class AlertResponse {

    private Long id;
    private Long userId;
    private String movieTitle;
    private String moviePoster;
    private String theaterName;
    private String city;
    private String screenType;
    private AlertStatus status;
    private LocalDateTime notifiedAt;
    private LocalDateTime createdAt;

    public AlertResponse() {}

    public AlertResponse(Long id, Long userId, String movieTitle, String moviePoster, String theaterName,
                         String city, String screenType, AlertStatus status,
                         LocalDateTime notifiedAt, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.movieTitle = movieTitle;
        this.moviePoster = moviePoster;
        this.theaterName = theaterName;
        this.city = city;
        this.screenType = screenType;
        this.status = status;
        this.notifiedAt = notifiedAt;
        this.createdAt = createdAt;
    }

    public static String resolvePosterByTitle(String title) {
        if (title == null || title.isBlank()) return "/posters/superman.jpg";
        String t = title.toLowerCase();
        if (t.contains("batman")) return "/posters/batman.jpg";
        if (t.contains("django")) return "/posters/django-unchained.jpg";
        if (t.contains("dune")) return "/posters/dune-part-two.jpg";
        if (t.contains("get out")) return "/posters/get-out.jpg";
        if (t.contains("incantation")) return "/posters/INCANTATION.jpg";
        if (t.contains("malignant")) return "/posters/malignant.jpg";
        if (t.contains("marty")) return "/posters/marty-supreme.jpg";
        if (t.contains("obsession")) return "/posters/OBSESSION.jpg";
        if (t.contains("oppenheimer")) return "/posters/oppenheimer.jpg";
        if (t.contains("parasite")) return "/posters/parasite.jpg";
        if (t.contains("seven") || t.contains("se7en")) return "/posters/se7en.jpg";
        if (t.contains("superman")) return "/posters/superman.jpg";
        if (t.contains("conjuring")) return "/posters/the-conjuring-last-rites.jpg";
        if (t.contains("whiplash")) return "/posters/Whiplash.jpg";
        if (t.contains("wolf")) return "/posters/wolf-of-wall-street.jpg";
        return "/posters/superman.jpg";
    }

    public static AlertResponse fromEntity(MovieAlert alert) {
        if (alert == null) {
            return null;
        }
        return new AlertResponse(
                alert.getId(),
                alert.getUser() != null ? alert.getUser().getId() : null,
                alert.getMovieTitle(),
                resolvePosterByTitle(alert.getMovieTitle()),
                alert.getTheaterName(),
                alert.getCity(),
                alert.getScreenType(),
                alert.getStatus(),
                alert.getNotifiedAt(),
                alert.getCreatedAt()
        );
    }

    public static AlertResponseBuilder builder() {
        return new AlertResponseBuilder();
    }

    public static class AlertResponseBuilder {
        private Long id;
        private Long userId;
        private String movieTitle;
        private String moviePoster;
        private String theaterName;
        private String city;
        private String screenType;
        private AlertStatus status;
        private LocalDateTime notifiedAt;
        private LocalDateTime createdAt;

        public AlertResponseBuilder id(Long id) { this.id = id; return this; }
        public AlertResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public AlertResponseBuilder movieTitle(String movieTitle) { this.movieTitle = movieTitle; return this; }
        public AlertResponseBuilder moviePoster(String moviePoster) { this.moviePoster = moviePoster; return this; }
        public AlertResponseBuilder theaterName(String theaterName) { this.theaterName = theaterName; return this; }
        public AlertResponseBuilder city(String city) { this.city = city; return this; }
        public AlertResponseBuilder screenType(String screenType) { this.screenType = screenType; return this; }
        public AlertResponseBuilder status(AlertStatus status) { this.status = status; return this; }
        public AlertResponseBuilder notifiedAt(LocalDateTime notifiedAt) { this.notifiedAt = notifiedAt; return this; }
        public AlertResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AlertResponse build() {
            String poster = moviePoster != null ? moviePoster : resolvePosterByTitle(movieTitle);
            return new AlertResponse(id, userId, movieTitle, poster, theaterName, city, screenType, status, notifiedAt, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public String getMoviePoster() {
        if (moviePoster != null && !moviePoster.isBlank()) {
            return moviePoster;
        }
        return resolvePosterByTitle(movieTitle);
    }
    public void setMoviePoster(String moviePoster) { this.moviePoster = moviePoster; }
    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getScreenType() { return screenType; }
    public void setScreenType(String screenType) { this.screenType = screenType; }
    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }
    public String getUiStatus() {
        if (status == AlertStatus.TRIGGERED) return "TICKETS_OPEN";
        if (status == AlertStatus.CANCELLED) return "CANCELLED";
        return "PENDING";
    }
    public LocalDateTime getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(LocalDateTime notifiedAt) { this.notifiedAt = notifiedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Frontend compatibility
    public String getLanguage() { return "English"; }
    public String getReleaseDate() { return "2026-07-11"; }
    public String getSubscribedAt() { return createdAt != null ? createdAt.toString() : null; }
    public String getUserEmail() { return "adamgoya0810@gmail.com"; }
    public String getNotes() { return "Release alert registered for " + (movieTitle != null ? movieTitle : "movie"); }
}
