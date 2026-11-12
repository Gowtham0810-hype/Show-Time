package com.cineai.model.dto.response;

import com.cineai.model.entity.Seat;
import com.cineai.model.enums.SeatCategory;
import com.cineai.model.enums.SeatStatus;

public class SeatResponse {

    private Long id;
    private Long showtimeId;
    private String seatRow;
    private Integer seatNumber;
    private SeatCategory seatCategory;
    private SeatStatus status;

    public SeatResponse() {}

    public SeatResponse(Long id, Long showtimeId, String seatRow, Integer seatNumber, SeatCategory seatCategory, SeatStatus status) {
        this.id = id;
        this.showtimeId = showtimeId;
        this.seatRow = seatRow;
        this.seatNumber = seatNumber;
        this.seatCategory = seatCategory;
        this.status = status;
    }

    public static SeatResponse fromEntity(Seat seat) {
        if (seat == null) {
            return null;
        }
        return new SeatResponse(
                seat.getId(),
                seat.getShowtime() != null ? seat.getShowtime().getId() : null,
                seat.getSeatRow(),
                seat.getSeatNumber(),
                seat.getSeatCategory(),
                seat.getStatus()
        );
    }

    public static SeatResponseBuilder builder() {
        return new SeatResponseBuilder();
    }

    public static class SeatResponseBuilder {
        private Long id;
        private Long showtimeId;
        private String seatRow;
        private Integer seatNumber;
        private SeatCategory seatCategory;
        private SeatStatus status;

        public SeatResponseBuilder id(Long id) { this.id = id; return this; }
        public SeatResponseBuilder showtimeId(Long showtimeId) { this.showtimeId = showtimeId; return this; }
        public SeatResponseBuilder seatRow(String seatRow) { this.seatRow = seatRow; return this; }
        public SeatResponseBuilder seatNumber(Integer seatNumber) { this.seatNumber = seatNumber; return this; }
        public SeatResponseBuilder seatCategory(SeatCategory seatCategory) { this.seatCategory = seatCategory; return this; }
        public SeatResponseBuilder status(SeatStatus status) { this.status = status; return this; }

        public SeatResponse build() {
            return new SeatResponse(id, showtimeId, seatRow, seatNumber, seatCategory, status);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
    public String getSeatRow() { return seatRow; }
    public void setSeatRow(String seatRow) { this.seatRow = seatRow; }
    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }
    public SeatCategory getSeatCategory() { return seatCategory; }
    public void setSeatCategory(SeatCategory seatCategory) { this.seatCategory = seatCategory; }
    public SeatStatus getStatus() { return status; }
    public void setStatus(SeatStatus status) { this.status = status; }
}
