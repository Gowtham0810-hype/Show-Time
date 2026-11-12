package com.cineai.model.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class HoldSeatsRequest {

    @NotEmpty(message = "Seat IDs cannot be empty")
    private List<Long> seatIds;

    public HoldSeatsRequest() {}

    public HoldSeatsRequest(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public static HoldSeatsRequestBuilder builder() {
        return new HoldSeatsRequestBuilder();
    }

    public static class HoldSeatsRequestBuilder {
        private List<Long> seatIds;

        public HoldSeatsRequestBuilder seatIds(List<Long> seatIds) {
            this.seatIds = seatIds;
            return this;
        }

        public HoldSeatsRequest build() {
            return new HoldSeatsRequest(seatIds);
        }
    }

    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }
}
