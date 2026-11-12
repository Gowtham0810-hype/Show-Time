package com.cineai.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_seats", uniqueConstraints = {
    @UniqueConstraint(name = "uk_booking_seats_booking_seat", columnNames = {"booking_id", "seat_id"})
})
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    public BookingSeat() {}

    public BookingSeat(Long id, Booking booking, Seat seat) {
        this.id = id;
        this.booking = booking;
        this.seat = seat;
    }

    public static BookingSeatBuilder builder() {
        return new BookingSeatBuilder();
    }

    public static class BookingSeatBuilder {
        private Long id;
        private Booking booking;
        private Seat seat;

        public BookingSeatBuilder id(Long id) { this.id = id; return this; }
        public BookingSeatBuilder booking(Booking booking) { this.booking = booking; return this; }
        public BookingSeatBuilder seat(Seat seat) { this.seat = seat; return this; }

        public BookingSeat build() {
            return new BookingSeat(id, booking, seat);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public Seat getSeat() { return seat; }
    public void setSeat(Seat seat) { this.seat = seat; }
}
