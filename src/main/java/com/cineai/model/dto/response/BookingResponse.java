package com.cineai.model.dto.response;

import com.cineai.model.entity.Booking;
import com.cineai.model.entity.BookingSeat;
import com.cineai.model.entity.Seat;
import com.cineai.model.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class BookingResponse {

    private Long id;
    private String bookingRef;
    private Long userId;
    private String userEmail;
    private Long showtimeId;
    private String movieTitle;
    private String moviePoster;
    private String theaterName;
    private String screenType;
    private LocalDate showDate;
    private LocalTime showTime;
    private List<String> seatLabels = new ArrayList<>();
    private List<Long> seatIds = new ArrayList<>();
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime bookedAt;

    public BookingResponse() {}

    public BookingResponse(Long id, String bookingRef, Long userId, String userEmail,
                           Long showtimeId, String movieTitle, String moviePoster, String theaterName, String screenType,
                           LocalDate showDate, LocalTime showTime, List<String> seatLabels,
                           List<Long> seatIds, BigDecimal totalAmount, BookingStatus status,
                           LocalDateTime bookedAt) {
        this.id = id;
        this.bookingRef = bookingRef;
        this.userId = userId;
        this.userEmail = userEmail;
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.moviePoster = moviePoster;
        this.theaterName = theaterName;
        this.screenType = screenType;
        this.showDate = showDate;
        this.showTime = showTime;
        this.seatLabels = seatLabels != null ? seatLabels : new ArrayList<>();
        this.seatIds = seatIds != null ? seatIds : new ArrayList<>();
        this.totalAmount = totalAmount;
        this.status = status;
        this.bookedAt = bookedAt;
    }

    public static String resolvePosterByTitle(String title) {
        if (title == null || title.isBlank()) return "/posters/batman.jpg";
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
        return "/posters/batman.jpg";
    }

    public static BookingResponse from(Booking booking, List<Seat> seats) {
        if (booking == null) {
            return null;
        }

        List<String> labels = new ArrayList<>();
        List<Long> ids = new ArrayList<>();

        if (seats != null && !seats.isEmpty()) {
            for (Seat seat : seats) {
                labels.add(seat.getSeatRow() + seat.getSeatNumber());
                ids.add(seat.getId());
            }
        } else if (booking.getBookingSeats() != null) {
            for (BookingSeat bs : booking.getBookingSeats()) {
                if (bs.getSeat() != null) {
                    labels.add(bs.getSeat().getSeatRow() + bs.getSeat().getSeatNumber());
                    ids.add(bs.getSeat().getId());
                }
            }
        }

        String poster = null;
        String title = null;
        if (booking.getShowtime() != null && booking.getShowtime().getMovie() != null) {
            title = booking.getShowtime().getMovie().getTitle();
            poster = booking.getShowtime().getMovie().getPosterUrl();
        }
        if (poster == null || poster.isBlank()) {
            poster = resolvePosterByTitle(title);
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingRef(booking.getBookingRef())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .showtimeId(booking.getShowtime() != null ? booking.getShowtime().getId() : null)
                .movieTitle(title)
                .moviePoster(poster)
                .theaterName(booking.getShowtime() != null && booking.getShowtime().getTheater() != null ? booking.getShowtime().getTheater().getName() : null)
                .screenType(booking.getShowtime() != null && booking.getShowtime().getTheater() != null && booking.getShowtime().getTheater().getScreenType() != null ? booking.getShowtime().getTheater().getScreenType().getValue() : null)
                .showDate(booking.getShowtime() != null ? booking.getShowtime().getShowDate() : null)
                .showTime(booking.getShowtime() != null ? booking.getShowtime().getShowTime() : null)
                .seatLabels(labels)
                .seatIds(ids)
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .bookedAt(booking.getBookedAt())
                .build();
    }

    public static BookingResponseBuilder builder() {
        return new BookingResponseBuilder();
    }

    public static class BookingResponseBuilder {
        private Long id;
        private String bookingRef;
        private Long userId;
        private String userEmail;
        private Long showtimeId;
        private String movieTitle;
        private String moviePoster;
        private String theaterName;
        private String screenType;
        private LocalDate showDate;
        private LocalTime showTime;
        private List<String> seatLabels = new ArrayList<>();
        private List<Long> seatIds = new ArrayList<>();
        private BigDecimal totalAmount;
        private BookingStatus status;
        private LocalDateTime bookedAt;

        public BookingResponseBuilder id(Long id) { this.id = id; return this; }
        public BookingResponseBuilder bookingRef(String bookingRef) { this.bookingRef = bookingRef; return this; }
        public BookingResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public BookingResponseBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public BookingResponseBuilder showtimeId(Long showtimeId) { this.showtimeId = showtimeId; return this; }
        public BookingResponseBuilder movieTitle(String movieTitle) { this.movieTitle = movieTitle; return this; }
        public BookingResponseBuilder moviePoster(String moviePoster) { this.moviePoster = moviePoster; return this; }
        public BookingResponseBuilder theaterName(String theaterName) { this.theaterName = theaterName; return this; }
        public BookingResponseBuilder screenType(String screenType) { this.screenType = screenType; return this; }
        public BookingResponseBuilder showDate(LocalDate showDate) { this.showDate = showDate; return this; }
        public BookingResponseBuilder showTime(LocalTime showTime) { this.showTime = showTime; return this; }
        public BookingResponseBuilder seatLabels(List<String> seatLabels) { this.seatLabels = seatLabels; return this; }
        public BookingResponseBuilder seatIds(List<Long> seatIds) { this.seatIds = seatIds; return this; }
        public BookingResponseBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public BookingResponseBuilder status(BookingStatus status) { this.status = status; return this; }
        public BookingResponseBuilder bookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; return this; }

        public BookingResponse build() {
            return new BookingResponse(id, bookingRef, userId, userEmail, showtimeId, movieTitle, moviePoster, theaterName, screenType, showDate, showTime, seatLabels, seatIds, totalAmount, status, bookedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
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
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }

    // Frontend compatibility accessors
    public String getBookingReference() { return bookingRef; }
    public String getTheatreName() { return theaterName; }
    public String getTheatreLocation() { return "Chennai"; }
    public String getTheatreId() { return "1"; }
    public String getMoviePoster() {
        if (moviePoster != null && !moviePoster.isBlank()) {
            return moviePoster;
        }
        return resolvePosterByTitle(movieTitle);
    }
    public void setMoviePoster(String moviePoster) {
        this.moviePoster = moviePoster;
    }
    public String getScreenName() { return theaterName != null ? (theaterName + " Screen 1") : "Screen 1"; }
    public String getDate() { return showDate != null ? showDate.toString() : null; }
    public String getTime() { return showTime != null ? showTime.toString().substring(0, 5) : null; }
    public String getFormat() { return screenType != null ? screenType : "IMAX 3D"; }
    public String getCustomerName() { return userEmail != null ? userEmail.split("@")[0] : "Cinema Patron"; }
    public String getCustomerEmail() { return userEmail; }
    public String getCreatedAt() { return bookedAt != null ? bookedAt.toString() : null; }
}
