package com.cineai.model.dto.response;

import com.cineai.model.entity.Showtime;
import com.cineai.model.enums.ShowtimeStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ShowtimeResponse {

    private Long id;
    private Long movieId;
    private String movieTitle;
    private Long theaterId;
    private String theaterName;
    private String theaterCity;
    private LocalDate showDate;
    private LocalTime showTime;
    private BigDecimal price;
    private ShowtimeStatus status;
    private LocalDateTime createdAt;
    private Integer totalSeats;
    private Integer availableSeats;

    public ShowtimeResponse() {}

    public ShowtimeResponse(Long id, Long movieId, String movieTitle, Long theaterId, String theaterName,
                            String theaterCity, LocalDate showDate, LocalTime showTime, BigDecimal price,
                            ShowtimeStatus status, LocalDateTime createdAt, Integer totalSeats, Integer availableSeats) {
        this.id = id;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.theaterId = theaterId;
        this.theaterName = theaterName;
        this.theaterCity = theaterCity;
        this.showDate = showDate;
        this.showTime = showTime;
        this.price = price;
        this.status = status;
        this.createdAt = createdAt;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
    }

    public static ShowtimeResponse fromEntity(Showtime showtime) {
        if (showtime == null) {
            return null;
        }
        return new ShowtimeResponse(
                showtime.getId(),
                showtime.getMovie() != null ? showtime.getMovie().getId() : null,
                showtime.getMovie() != null ? showtime.getMovie().getTitle() : null,
                showtime.getTheater() != null ? showtime.getTheater().getId() : null,
                showtime.getTheater() != null ? showtime.getTheater().getName() : null,
                showtime.getTheater() != null ? showtime.getTheater().getCity() : null,
                showtime.getShowDate(),
                showtime.getShowTime(),
                showtime.getPrice(),
                showtime.getStatus(),
                showtime.getCreatedAt(),
                null,
                null
        );
    }

    public static ShowtimeResponseBuilder builder() {
        return new ShowtimeResponseBuilder();
    }

    public static class ShowtimeResponseBuilder {
        private Long id;
        private Long movieId;
        private String movieTitle;
        private Long theaterId;
        private String theaterName;
        private String theaterCity;
        private LocalDate showDate;
        private LocalTime showTime;
        private BigDecimal price;
        private ShowtimeStatus status;
        private LocalDateTime createdAt;
        private Integer totalSeats;
        private Integer availableSeats;

        public ShowtimeResponseBuilder id(Long id) { this.id = id; return this; }
        public ShowtimeResponseBuilder movieId(Long movieId) { this.movieId = movieId; return this; }
        public ShowtimeResponseBuilder movieTitle(String movieTitle) { this.movieTitle = movieTitle; return this; }
        public ShowtimeResponseBuilder theaterId(Long theaterId) { this.theaterId = theaterId; return this; }
        public ShowtimeResponseBuilder theaterName(String theaterName) { this.theaterName = theaterName; return this; }
        public ShowtimeResponseBuilder theaterCity(String theaterCity) { this.theaterCity = theaterCity; return this; }
        public ShowtimeResponseBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public ShowtimeResponseBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public ShowtimeResponseBuilder price(BigDecimal price) { this.price = price; return this; }
        public ShowtimeResponseBuilder status(ShowtimeStatus status) { this.status = status; return this; }
        public ShowtimeResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ShowtimeResponseBuilder totalSeats(Integer totalSeats) { this.totalSeats = totalSeats; return this; }
        public ShowtimeResponseBuilder availableSeats(Integer availableSeats) { this.availableSeats = availableSeats; return this; }

        public ShowtimeResponse build() {
            return new ShowtimeResponse(id, movieId, movieTitle, theaterId, theaterName, theaterCity, showDate, showTime, price, status, createdAt, totalSeats, availableSeats);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public Long getTheaterId() { return theaterId; }
    public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }
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
    public ShowtimeStatus getStatus() { return status; }
    public void setStatus(ShowtimeStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    // Frontend compatibility accessors
    public String getTheatreId() { return theaterId != null ? theaterId.toString() : null; }
    public String getDate() { return showDate != null ? showDate.toString() : null; }
    public String getTime() { return showTime != null ? showTime.toString().substring(0, 5) : null; }
    public String getFormat() { return "IMAX 3D"; }
    public String getScreenId() { return "sc-" + theaterId + "-1"; }
    public String getScreenName() { return theaterName != null ? (theaterName + " Screen 1") : "Screen 1"; }
    public Integer getAvailableSeatsCount() { return availableSeats != null ? availableSeats : (totalSeats != null ? totalSeats : 96); }
    public Integer getTotalSeatsCount() { return totalSeats != null ? totalSeats : 96; }
}
