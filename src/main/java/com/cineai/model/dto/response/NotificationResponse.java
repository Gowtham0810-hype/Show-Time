package com.cineai.model.dto.response;

import com.cineai.model.entity.AlertNotification;
import com.cineai.model.enums.NotificationChannel;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class NotificationResponse {

    private Long id;
    private Long alertId;
    private String movieTitle;
    private String theaterName;
    private String theaterCity;
    private LocalDate showDate;
    private LocalTime showTime;
    private BigDecimal price;
    private NotificationChannel channel;
    private LocalDateTime sentAt;

    public NotificationResponse() {}

    public NotificationResponse(Long id, Long alertId, String movieTitle, String theaterName,
                                String theaterCity, LocalDate showDate, LocalTime showTime,
                                BigDecimal price, NotificationChannel channel, LocalDateTime sentAt) {
        this.id = id;
        this.alertId = alertId;
        this.movieTitle = movieTitle;
        this.theaterName = theaterName;
        this.theaterCity = theaterCity;
        this.showDate = showDate;
        this.showTime = showTime;
        this.price = price;
        this.channel = channel;
        this.sentAt = sentAt;
    }

    public static NotificationResponse fromEntity(AlertNotification n) {
        if (n == null) return null;

        String movieTitle = (n.getShowtime() != null && n.getShowtime().getMovie() != null)
                ? n.getShowtime().getMovie().getTitle()
                : (n.getAlert() != null ? n.getAlert().getMovieTitle() : null);

        String theaterName = (n.getShowtime() != null && n.getShowtime().getTheater() != null)
                ? n.getShowtime().getTheater().getName()
                : (n.getAlert() != null ? n.getAlert().getTheaterName() : null);

        String theaterCity = (n.getShowtime() != null && n.getShowtime().getTheater() != null)
                ? n.getShowtime().getTheater().getCity()
                : (n.getAlert() != null ? n.getAlert().getCity() : null);

        LocalDate date = (n.getShowtime() != null) ? n.getShowtime().getShowDate() : null;
        LocalTime time = (n.getShowtime() != null) ? n.getShowtime().getShowTime() : null;
        BigDecimal price = (n.getShowtime() != null) ? n.getShowtime().getPrice() : null;

        return new NotificationResponse(
                n.getId(),
                n.getAlert() != null ? n.getAlert().getId() : null,
                movieTitle,
                theaterName,
                theaterCity,
                date,
                time,
                price,
                n.getChannel(),
                n.getSentAt()
        );
    }

    public static NotificationResponseBuilder builder() {
        return new NotificationResponseBuilder();
    }

    public static class NotificationResponseBuilder {
        private Long id;
        private Long alertId;
        private String movieTitle;
        private String theaterName;
        private String theaterCity;
        private LocalDate showDate;
        private LocalTime showTime;
        private BigDecimal price;
        private NotificationChannel channel;
        private LocalDateTime sentAt;

        public NotificationResponseBuilder id(Long id) { this.id = id; return this; }
        public NotificationResponseBuilder alertId(Long alertId) { this.alertId = alertId; return this; }
        public NotificationResponseBuilder movieTitle(String movieTitle) { this.movieTitle = movieTitle; return this; }
        public NotificationResponseBuilder theaterName(String theaterName) { this.theaterName = theaterName; return this; }
        public NotificationResponseBuilder theaterCity(String theaterCity) { this.theaterCity = theaterCity; return this; }
        public NotificationResponseBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public NotificationResponseBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public NotificationResponseBuilder price(BigDecimal price) { this.price = price; return this; }
        public NotificationResponseBuilder channel(NotificationChannel channel) { this.channel = channel; return this; }
        public NotificationResponseBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }

        public NotificationResponse build() {
            return new NotificationResponse(id, alertId, movieTitle, theaterName, theaterCity, showDate, showTime, price, channel, sentAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAlertId() { return alertId; }
    public void setAlertId(Long alertId) { this.alertId = alertId; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }
    public String getTheaterCity() { return theaterCity; }
    public void setTheaterCity(String theaterCity) { this.theaterCity = theaterCity; }
    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }
    public LocalTime getShowTime() { return showTime; }
    public void setShowTime(LocalTime showTime) { this.showTime = showTime; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
