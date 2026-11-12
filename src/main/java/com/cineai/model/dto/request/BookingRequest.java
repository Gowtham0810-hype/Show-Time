package com.cineai.model.dto.request;

import java.util.List;

public class BookingRequest {

    private Long showtimeId;
    private List<Long> seatIds;
    private String holdToken;
    private String customerName;
    private String customerEmail;

    public BookingRequest() {}

    public BookingRequest(Long showtimeId, List<Long> seatIds) {
        this.showtimeId = showtimeId;
        this.seatIds = seatIds;
    }

    public static BookingRequestBuilder builder() {
        return new BookingRequestBuilder();
    }

    public static class BookingRequestBuilder {
        private Long showtimeId;
        private List<Long> seatIds;
        private String holdToken;
        private String customerName;
        private String customerEmail;

        public BookingRequestBuilder showtimeId(Long showtimeId) {
            this.showtimeId = showtimeId;
            return this;
        }

        public BookingRequestBuilder seatIds(List<Long> seatIds) {
            this.seatIds = seatIds;
            return this;
        }

        public BookingRequestBuilder holdToken(String holdToken) {
            this.holdToken = holdToken;
            return this;
        }

        public BookingRequestBuilder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public BookingRequestBuilder customerEmail(String customerEmail) {
            this.customerEmail = customerEmail;
            return this;
        }

        public BookingRequest build() {
            BookingRequest req = new BookingRequest(showtimeId, seatIds);
            req.setHoldToken(holdToken);
            req.setCustomerName(customerName);
            req.setCustomerEmail(customerEmail);
            return req;
        }
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public String getHoldToken() {
        return holdToken;
    }

    public void setHoldToken(String holdToken) {
        this.holdToken = holdToken;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
}
