package com.cineai.model.entity;

import com.cineai.model.enums.ShowtimeStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "showtimes", uniqueConstraints = {
    @UniqueConstraint(name = "uk_showtimes_theater_date_time", columnNames = {"theater_id", "show_date", "show_time"})
})
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "show_time", nullable = false)
    private LocalTime showTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShowtimeStatus status = ShowtimeStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Showtime() {}

    public Showtime(Long id, Movie movie, Theater theater, LocalDate showDate, LocalTime showTime,
                    BigDecimal price, ShowtimeStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.movie = movie;
        this.theater = theater;
        this.showDate = showDate;
        this.showTime = showTime;
        this.price = price;
        this.status = status != null ? status : ShowtimeStatus.ACTIVE;
        this.createdAt = createdAt;
    }

    public static ShowtimeBuilder builder() {
        return new ShowtimeBuilder();
    }

    public static class ShowtimeBuilder {
        private Long id;
        private Movie movie;
        private Theater theater;
        private LocalDate showDate;
        private LocalTime showTime;
        private BigDecimal price;
        private ShowtimeStatus status = ShowtimeStatus.ACTIVE;
        private LocalDateTime createdAt;

        public ShowtimeBuilder id(Long id) { this.id = id; return this; }
        public ShowtimeBuilder movie(Movie movie) { this.movie = movie; return this; }
        public ShowtimeBuilder theater(Theater theater) { this.theater = theater; return this; }
        public ShowtimeBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public ShowtimeBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public ShowtimeBuilder price(BigDecimal price) { this.price = price; return this; }
        public ShowtimeBuilder status(ShowtimeStatus status) { this.status = status; return this; }
        public ShowtimeBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Showtime build() {
            return new Showtime(id, movie, theater, showDate, showTime, price, status, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }
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
}
