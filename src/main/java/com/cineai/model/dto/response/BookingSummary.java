package com.cineai.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class BookingSummary {

    private Long showtimeId;
    private String movieTitle;
    private String theaterName;
    private String screenType;
    private LocalDate showDate;
    private LocalTime showTime;
    private List<String> seatLabels = new ArrayList<>();
    private List<Long> seatIds = new ArrayList<>();
    private BigDecimal totalAmount;

    public BookingSummary() {}

    public BookingSummary(Long showtimeId, String movieTitle, String theaterName, String screenType,
                          LocalDate showDate, LocalTime showTime, List<String> seatLabels,
                          List<Long> seatIds, BigDecimal totalAmount) {
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.theaterName = theaterName;
        this.screenType = screenType;
        this.showDate = showDate;
        this.showTime = showTime;
        this.seatLabels = seatLabels != null ? seatLabels : new ArrayList<>();
        this.seatIds = seatIds != null ? seatIds : new ArrayList<>();
        this.totalAmount = totalAmount;
    }

    public static BookingSummaryBuilder builder() {
        return new BookingSummaryBuilder();
    }

    public static class BookingSummaryBuilder {
        private Long showtimeId;
        private String movieTitle;
        private String theaterName;
        private String screenType;
        private LocalDate showDate;
        private LocalTime showTime;
        private List<String> seatLabels = new ArrayList<>();
        private List<Long> seatIds = new ArrayList<>();
        private BigDecimal totalAmount;

        public BookingSummaryBuilder showtimeId(Long showtimeId) { this.showtimeId = showtimeId; return this; }
        public BookingSummaryBuilder movieTitle(String movieTitle) { this.movieTitle = movieTitle; return this; }
        public BookingSummaryBuilder theaterName(String theaterName) { this.theaterName = theaterName; return this; }
        public BookingSummaryBuilder screenType(String screenType) { this.screenType = screenType; return this; }
        public BookingSummaryBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public BookingSummaryBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public BookingSummaryBuilder seatLabels(List<String> seatLabels) { this.seatLabels = seatLabels; return this; }
        public BookingSummaryBuilder seatIds(List<Long> seatIds) { this.seatIds = seatIds; return this; }
        public BookingSummaryBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }

        public BookingSummary build() {
            return new BookingSummary(showtimeId, movieTitle, theaterName, screenType, showDate, showTime, seatLabels, seatIds, totalAmount);
        }
    }

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }
    public String getScreenType() { return screenType; }
    public void setScreenType(String screenType) { this.screenType = screenType; }
    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }
    public LocalTime getShowTime() { return showTime; }
    public void setShowTime(LocalTime showTime) { this.showTime = showTime; }
    public List<String> getSeatLabels() { return seatLabels; }
    public void setSeatLabels(List<String> seatLabels) { this.seatLabels = seatLabels; }
    public List<Long> getSeatIds() { return seatIds; }
    public void setSeatIds(List<Long> seatIds) { this.seatIds = seatIds; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}
