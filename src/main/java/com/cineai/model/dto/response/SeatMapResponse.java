package com.cineai.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class SeatMapResponse {

    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private Long theaterId;
    private String theaterName;
    private String screenType;
    private LocalDate showDate;
    private LocalTime showTime;
    private BigDecimal basePrice;
    private Integer totalRows;
    private Integer seatsPerRow;
    private List<SeatItemDto> seats = new ArrayList<>();

    public SeatMapResponse() {}

    public SeatMapResponse(Long showtimeId, Long movieId, String movieTitle, Long theaterId,
                           String theaterName, String screenType, LocalDate showDate, LocalTime showTime,
                           BigDecimal basePrice, Integer totalRows, Integer seatsPerRow, List<SeatItemDto> seats) {
        this.showtimeId = showtimeId;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.theaterId = theaterId;
        this.theaterName = theaterName;
        this.screenType = screenType;
        this.showDate = showDate;
        this.showTime = showTime;
        this.basePrice = basePrice;
        this.totalRows = totalRows;
        this.seatsPerRow = seatsPerRow;
        this.seats = seats != null ? seats : new ArrayList<>();
    }

    public static SeatMapResponseBuilder builder() {
        return new SeatMapResponseBuilder();
    }

    public static class SeatMapResponseBuilder {
        private Long showtimeId;
        private Long movieId;
        private String movieTitle;
        private Long theaterId;
        private String theaterName;
        private String screenType;
        private LocalDate showDate;
        private LocalTime showTime;
        private BigDecimal basePrice;
        private Integer totalRows;
        private Integer seatsPerRow;
        private List<SeatItemDto> seats = new ArrayList<>();

        public SeatMapResponseBuilder showtimeId(Long showtimeId) { this.showtimeId = showtimeId; return this; }
        public SeatMapResponseBuilder movieId(Long movieId) { this.movieId = movieId; return this; }
        public SeatMapResponseBuilder movieTitle(String movieTitle) { this.movieTitle = movieTitle; return this; }
        public SeatMapResponseBuilder theaterId(Long theaterId) { this.theaterId = theaterId; return this; }
        public SeatMapResponseBuilder theaterName(String theaterName) { this.theaterName = theaterName; return this; }
        public SeatMapResponseBuilder screenType(String screenType) { this.screenType = screenType; return this; }
        public SeatMapResponseBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public SeatMapResponseBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public SeatMapResponseBuilder basePrice(BigDecimal basePrice) { this.basePrice = basePrice; return this; }
        public SeatMapResponseBuilder totalRows(Integer totalRows) { this.totalRows = totalRows; return this; }
        public SeatMapResponseBuilder seatsPerRow(Integer seatsPerRow) { this.seatsPerRow = seatsPerRow; return this; }
        public SeatMapResponseBuilder seats(List<SeatItemDto> seats) { this.seats = seats; return this; }

        public SeatMapResponse build() {
            return new SeatMapResponse(showtimeId, movieId, movieTitle, theaterId, theaterName, screenType, showDate, showTime, basePrice, totalRows, seatsPerRow, seats);
        }
    }

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public Long getTheaterId() { return theaterId; }
    public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }
    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }
    public String getScreenType() { return screenType; }
    public void setScreenType(String screenType) { this.screenType = screenType; }
    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }
    public LocalTime getShowTime() { return showTime; }
    public void setShowTime(LocalTime showTime) { this.showTime = showTime; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Integer getTotalRows() { return totalRows; }
    public void setTotalRows(Integer totalRows) { this.totalRows = totalRows; }
    public Integer getSeatsPerRow() { return seatsPerRow; }
    public void setSeatsPerRow(Integer seatsPerRow) { this.seatsPerRow = seatsPerRow; }
    public List<SeatItemDto> getSeats() { return seats; }
    public void setSeats(List<SeatItemDto> seats) { this.seats = seats; }

    // Frontend compatibility
    public ShowtimeResponse getShowtime() {
        return ShowtimeResponse.builder()
                .id(showtimeId)
                .movieId(movieId)
                .movieTitle(movieTitle)
                .theaterId(theaterId)
                .theaterName(theaterName)
                .showDate(showDate)
                .showTime(showTime)
                .price(basePrice)
                .build();
    }
}
