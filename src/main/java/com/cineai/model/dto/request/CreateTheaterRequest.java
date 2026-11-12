package com.cineai.model.dto.request;

import com.cineai.model.enums.ScreenType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTheaterRequest {

    @NotBlank(message = "Theater name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "City is required")
    private String city;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "Total rows is required")
    @Min(value = 1, message = "Total rows must be at least 1")
    @Max(value = 26, message = "Total rows cannot exceed 26 (A-Z)")
    private Integer totalRows;

    @NotNull(message = "Seats per row is required")
    @Min(value = 1, message = "Seats per row must be at least 1")
    @Max(value = 50, message = "Seats per row cannot exceed 50")
    private Integer seatsPerRow;

    private ScreenType screenType;

    public CreateTheaterRequest() {}

    public CreateTheaterRequest(String name, String location, String city, Double latitude, Double longitude,
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

    public static CreateTheaterRequestBuilder builder() {
        return new CreateTheaterRequestBuilder();
    }

    public static class CreateTheaterRequestBuilder {
        private String name;
        private String location;
        private String city;
        private Double latitude;
        private Double longitude;
        private Integer totalRows;
        private Integer seatsPerRow;
        private ScreenType screenType;

        public CreateTheaterRequestBuilder name(String name) { this.name = name; return this; }
        public CreateTheaterRequestBuilder location(String location) { this.location = location; return this; }
        public CreateTheaterRequestBuilder city(String city) { this.city = city; return this; }
        public CreateTheaterRequestBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public CreateTheaterRequestBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public CreateTheaterRequestBuilder totalRows(Integer totalRows) { this.totalRows = totalRows; return this; }
        public CreateTheaterRequestBuilder seatsPerRow(Integer seatsPerRow) { this.seatsPerRow = seatsPerRow; return this; }
        public CreateTheaterRequestBuilder screenType(ScreenType screenType) { this.screenType = screenType; return this; }

        public CreateTheaterRequest build() {
            return new CreateTheaterRequest(name, location, city, latitude, longitude, totalRows, seatsPerRow, screenType);
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
