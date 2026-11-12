package com.cineai.model.dto.response;

import com.cineai.model.enums.SeatCategory;
import com.cineai.model.enums.SeatStatus;

public class SeatItemDto {

    private Long id;
    private String seatRow;
    private Integer seatNumber;
    private String label;
    private SeatCategory seatCategory;
    private SeatStatus status;
    private boolean heldByCurrentUser;

    public SeatItemDto() {}

    public SeatItemDto(Long id, String seatRow, Integer seatNumber, String label,
                       SeatCategory seatCategory, SeatStatus status, boolean heldByCurrentUser) {
        this.id = id;
        this.seatRow = seatRow;
        this.seatNumber = seatNumber;
        this.label = label != null ? label : (seatRow + seatNumber);
        this.seatCategory = seatCategory;
        this.status = status;
        this.heldByCurrentUser = heldByCurrentUser;
    }

    public static SeatItemDtoBuilder builder() {
        return new SeatItemDtoBuilder();
    }

    public static class SeatItemDtoBuilder {
        private Long id;
        private String seatRow;
        private Integer seatNumber;
        private String label;
        private SeatCategory seatCategory;
        private SeatStatus status;
        private boolean heldByCurrentUser;

        public SeatItemDtoBuilder id(Long id) { this.id = id; return this; }
        public SeatItemDtoBuilder seatRow(String seatRow) { this.seatRow = seatRow; return this; }
        public SeatItemDtoBuilder seatNumber(Integer seatNumber) { this.seatNumber = seatNumber; return this; }
        public SeatItemDtoBuilder label(String label) { this.label = label; return this; }
        public SeatItemDtoBuilder seatCategory(SeatCategory seatCategory) { this.seatCategory = seatCategory; return this; }
        public SeatItemDtoBuilder status(SeatStatus status) { this.status = status; return this; }
        public SeatItemDtoBuilder heldByCurrentUser(boolean heldByCurrentUser) { this.heldByCurrentUser = heldByCurrentUser; return this; }

        public SeatItemDto build() {
            return new SeatItemDto(id, seatRow, seatNumber, label, seatCategory, status, heldByCurrentUser);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSeatRow() { return seatRow; }
    public void setSeatRow(String seatRow) { this.seatRow = seatRow; }
    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public SeatCategory getSeatCategory() { return seatCategory; }
    public void setSeatCategory(SeatCategory seatCategory) { this.seatCategory = seatCategory; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public SeatStatus getStatus() { return status; }
    public void setStatus(SeatStatus status) { this.status = status; }
    public boolean isHeldByCurrentUser() { return heldByCurrentUser; }
    public void setHeldByCurrentUser(boolean heldByCurrentUser) { this.heldByCurrentUser = heldByCurrentUser; }

    // Frontend compatibility
    public String getRow() { return seatRow; }
    public Integer getNumber() { return seatNumber; }
    public String getTier() {
        if (seatCategory == null) return "standard";
        return switch (seatCategory) {
            case VIP -> "vip";
            case PREMIUM -> "premium";
            case REGULAR -> "standard";
        };
    }
    public java.math.BigDecimal getPrice() {
        if (seatCategory == null) return new java.math.BigDecimal("250.00");
        return switch (seatCategory) {
            case VIP -> new java.math.BigDecimal("450.00");
            case PREMIUM -> new java.math.BigDecimal("350.00");
            case REGULAR -> new java.math.BigDecimal("250.00");
        };
    }
    @com.fasterxml.jackson.annotation.JsonProperty("status")
    public String getEffectiveStatus() {
        if (status == null) return "available";
        return status.name().toLowerCase();
    }
}
