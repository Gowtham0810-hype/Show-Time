package com.cineai.model.entity;

import com.cineai.model.enums.SeatCategory;
import com.cineai.model.enums.SeatStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(name = "uk_seats_showtime_row_number", columnNames = {"showtime_id", "seat_row", "seat_number"})
})
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(name = "seat_row", nullable = false, length = 10)
    private String seatRow;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_category", length = 20)
    private SeatCategory seatCategory = SeatCategory.REGULAR;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    public Seat() {}

    public Seat(Long id, Showtime showtime, String seatRow, Integer seatNumber, SeatCategory seatCategory, SeatStatus status, Long version) {
        this.id = id;
        this.showtime = showtime;
        this.seatRow = seatRow;
        this.seatNumber = seatNumber;
        this.seatCategory = seatCategory != null ? seatCategory : SeatCategory.REGULAR;
        this.status = status != null ? status : SeatStatus.AVAILABLE;
        this.version = version != null ? version : 0L;
    }

    public static SeatBuilder builder() {
        return new SeatBuilder();
    }

    public static class SeatBuilder {
        private Long id;
        private Showtime showtime;
        private String seatRow;
        private Integer seatNumber;
        private SeatCategory seatCategory = SeatCategory.REGULAR;
        private SeatStatus status = SeatStatus.AVAILABLE;
        private Long version = 0L;

        public SeatBuilder id(Long id) { this.id = id; return this; }
        public SeatBuilder showtime(Showtime showtime) { this.showtime = showtime; return this; }
        public SeatBuilder seatRow(String seatRow) { this.seatRow = seatRow; return this; }
        public SeatBuilder seatNumber(Integer seatNumber) { this.seatNumber = seatNumber; return this; }
        public SeatBuilder seatCategory(SeatCategory seatCategory) { this.seatCategory = seatCategory; return this; }
        public SeatBuilder status(SeatStatus status) { this.status = status; return this; }
        public SeatBuilder version(Long version) { this.version = version; return this; }

        public Seat build() {
            return new Seat(id, showtime, seatRow, seatNumber, seatCategory, status, version);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Showtime getShowtime() { return showtime; }
    public void setShowtime(Showtime showtime) { this.showtime = showtime; }
    public String getSeatRow() { return seatRow; }
    public void setSeatRow(String seatRow) { this.seatRow = seatRow; }
    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }
    public SeatCategory getSeatCategory() { return seatCategory; }
    public void setSeatCategory(SeatCategory seatCategory) { this.seatCategory = seatCategory; }
    public SeatStatus getStatus() { return status; }
    public void setStatus(SeatStatus status) { this.status = status; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
