package com.cineai.model.entity;

import com.cineai.model.enums.BookingStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(name = "booking_ref", nullable = false, unique = true, length = 20)
    private String bookingRef;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @CreationTimestamp
    @Column(name = "booked_at", nullable = false, updatable = false)
    private LocalDateTime bookedAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingSeat> bookingSeats = new ArrayList<>();

    public Booking() {}

    public Booking(Long id, User user, Showtime showtime, String bookingRef, BigDecimal totalAmount,
                   BookingStatus status, LocalDateTime bookedAt, List<BookingSeat> bookingSeats) {
        this.id = id;
        this.user = user;
        this.showtime = showtime;
        this.bookingRef = bookingRef;
        this.totalAmount = totalAmount;
        this.status = status != null ? status : BookingStatus.CONFIRMED;
        this.bookedAt = bookedAt;
        this.bookingSeats = bookingSeats != null ? bookingSeats : new ArrayList<>();
    }

    public static BookingBuilder builder() {
        return new BookingBuilder();
    }

    public static class BookingBuilder {
        private Long id;
        private User user;
        private Showtime showtime;
        private String bookingRef;
        private BigDecimal totalAmount;
        private BookingStatus status = BookingStatus.CONFIRMED;
        private LocalDateTime bookedAt;
        private List<BookingSeat> bookingSeats = new ArrayList<>();

        public BookingBuilder id(Long id) { this.id = id; return this; }
        public BookingBuilder user(User user) { this.user = user; return this; }
        public BookingBuilder showtime(Showtime showtime) { this.showtime = showtime; return this; }
        public BookingBuilder bookingRef(String bookingRef) { this.bookingRef = bookingRef; return this; }
        public BookingBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public BookingBuilder status(BookingStatus status) { this.status = status; return this; }
        public BookingBuilder bookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; return this; }
        public BookingBuilder bookingSeats(List<BookingSeat> bookingSeats) { this.bookingSeats = bookingSeats; return this; }

        public Booking build() {
            return new Booking(id, user, showtime, bookingRef, totalAmount, status, bookedAt, bookingSeats);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Showtime getShowtime() { return showtime; }
    public void setShowtime(Showtime showtime) { this.showtime = showtime; }
    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
    public List<BookingSeat> getBookingSeats() { return bookingSeats; }
    public void setBookingSeats(List<BookingSeat> bookingSeats) { this.bookingSeats = bookingSeats; }
}
