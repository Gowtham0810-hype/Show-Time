package com.cineai.model.dto.request;

import com.cineai.model.enums.ShowtimeStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class CreateShowtimeRequest {

    @NotNull(message = "Movie ID is required")
    private Long movieId;

    @NotNull(message = "Theater ID is required")
    @JsonAlias({"theaterId", "theatreId"})
    private Long theaterId;

    @NotNull(message = "Show date is required")
    @JsonAlias({"showDate", "date"})
    private LocalDate showDate;

    @NotNull(message = "Show time is required")
    @JsonAlias({"showTime", "time"})
    private LocalTime showTime;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    private ShowtimeStatus status;

    public CreateShowtimeRequest() {}

    public CreateShowtimeRequest(Long movieId, Long theaterId, LocalDate showDate, LocalTime showTime,
                                 BigDecimal price, ShowtimeStatus status) {
        this.movieId = movieId;
        this.theaterId = theaterId;
        this.showDate = showDate;
        this.showTime = showTime;
        this.price = price;
        this.status = status;
    }

    public static CreateShowtimeRequestBuilder builder() {
        return new CreateShowtimeRequestBuilder();
    }

    public static class CreateShowtimeRequestBuilder {
        private Long movieId;
        private Long theaterId;
        private LocalDate showDate;
        private LocalTime showTime;
        private BigDecimal price;
        private ShowtimeStatus status;

        public CreateShowtimeRequestBuilder movieId(Long movieId) { this.movieId = movieId; return this; }
        public CreateShowtimeRequestBuilder theaterId(Long theaterId) { this.theaterId = theaterId; return this; }
        public CreateShowtimeRequestBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public CreateShowtimeRequestBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public CreateShowtimeRequestBuilder price(BigDecimal price) { this.price = price; return this; }
        public CreateShowtimeRequestBuilder status(ShowtimeStatus status) { this.status = status; return this; }

        public CreateShowtimeRequest build() {
            return new CreateShowtimeRequest(movieId, theaterId, showDate, showTime, price, status);
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
