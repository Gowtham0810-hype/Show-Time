package com.cineai.model.dto.request;

import com.cineai.model.enums.ShowtimeStatus;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class UpdateShowtimeRequest {

    private Long movieId;
    private Long theaterId;
    private LocalDate showDate;
    private LocalTime showTime;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    private ShowtimeStatus status;

    public UpdateShowtimeRequest() {}

    public UpdateShowtimeRequest(Long movieId, Long theaterId, LocalDate showDate, LocalTime showTime,
                                 BigDecimal price, ShowtimeStatus status) {
        this.movieId = movieId;
        this.theaterId = theaterId;
        this.showDate = showDate;
        this.showTime = showTime;
        this.price = price;
        this.status = status;
    }

    public static UpdateShowtimeRequestBuilder builder() {
        return new UpdateShowtimeRequestBuilder();
    }

    public static class UpdateShowtimeRequestBuilder {
        private Long movieId;
        private Long theaterId;
        private LocalDate showDate;
        private LocalTime showTime;
        private BigDecimal price;
        private ShowtimeStatus status;

        public UpdateShowtimeRequestBuilder movieId(Long movieId) { this.movieId = movieId; return this; }
        public UpdateShowtimeRequestBuilder theaterId(Long theaterId) { this.theaterId = theaterId; return this; }
        public UpdateShowtimeRequestBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public UpdateShowtimeRequestBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public UpdateShowtimeRequestBuilder price(BigDecimal price) { this.price = price; return this; }
        public UpdateShowtimeRequestBuilder status(ShowtimeStatus status) { this.status = status; return this; }

        public UpdateShowtimeRequest build() {
            return new UpdateShowtimeRequest(movieId, theaterId, showDate, showTime, price, status);
        }
    }

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
    public Long getTheaterId() { return theaterId; }
    public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }
    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }
    public LocalTime getShowTime() { return showTime; }
    public void setShowTime(LocalTime showTime) { this.showTime = showTime; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public ShowtimeStatus getStatus() { return status; }
    public void setStatus(ShowtimeStatus status) { this.status = status; }
}
