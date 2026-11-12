package com.cineai.model.dto.request;

import com.cineai.model.enums.ScreenType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class UpdateTheaterRequest {

    private String name;
    private String location;
    private String city;
    private Double latitude;
    private Double longitude;

    @Min(value = 1, message = "Total rows must be at least 1")
    @Max(value = 26, message = "Total rows cannot exceed 26 (A-Z)")
    private Integer totalRows;

    @Min(value = 1, message = "Seats per row must be at least 1")
    @Max(value = 50, message = "Seats per row cannot exceed 50")
    private Integer seatsPerRow;

    private ScreenType screenType;

    public UpdateTheaterRequest() {}

    public UpdateTheaterRequest(String name, String location, String city, Double latitude, Double longitude,
                                Integer totalRows, Integer seatsPerRow, ScreenType screenType) {
        this.name = name;
        this.location = location;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.totalRows = totalRows;
        this.seatsPerRow = seatsPerRow;
        this.screenType = screenType;
    }

    public static UpdateTheaterRequestBuilder builder() {
        return new UpdateTheaterRequestBuilder();
    }

    public static class UpdateTheaterRequestBuilder {
        private String name;
        private String location;
        private String city;
        private Double latitude;
        private Double longitude;
        private Integer totalRows;
        private Integer seatsPerRow;
        private ScreenType screenType;

        public UpdateTheaterRequestBuilder name(String name) { this.name = name; return this; }
        public UpdateTheaterRequestBuilder location(String location) { this.location = location; return this; }
        public UpdateTheaterRequestBuilder city(String city) { this.city = city; return this; }
        public UpdateTheaterRequestBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public UpdateTheaterRequestBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public UpdateTheaterRequestBuilder totalRows(Integer totalRows) { this.totalRows = totalRows; return this; }
        public UpdateTheaterRequestBuilder seatsPerRow(Integer seatsPerRow) { this.seatsPerRow = seatsPerRow; return this; }
        public UpdateTheaterRequestBuilder screenType(ScreenType screenType) { this.screenType = screenType; return this; }

        public UpdateTheaterRequest build() {
            return new UpdateTheaterRequest(name, location, city, latitude, longitude, totalRows, seatsPerRow, screenType);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Integer getTotalRows() { return totalRows; }
    public void setTotalRows(Integer totalRows) { this.totalRows = totalRows; }
    public Integer getSeatsPerRow() { return seatsPerRow; }
    public void setSeatsPerRow(Integer seatsPerRow) { this.seatsPerRow = seatsPerRow; }
    public ScreenType getScreenType() { return screenType; }
    public void setScreenType(ScreenType screenType) { this.screenType = screenType; }
}
