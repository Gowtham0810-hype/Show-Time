package com.cineai.model.dto.response;

import com.cineai.model.entity.Theater;
import com.cineai.model.enums.ScreenType;

public class TheaterResponse {

    private Long id;
    private String name;
    private String location;
    private String city;
    private Double latitude;
    private Double longitude;
    private Integer totalRows;
    private Integer seatsPerRow;
    private ScreenType screenType;
    private Integer capacity;
    private Double distanceKm;

    public TheaterResponse() {}

    public TheaterResponse(Long id, String name, String location, String city, Double latitude, Double longitude,
                           Integer totalRows, Integer seatsPerRow, ScreenType screenType, Integer capacity) {
        this(id, name, location, city, latitude, longitude, totalRows, seatsPerRow, screenType, capacity, null);
    }

    public TheaterResponse(Long id, String name, String location, String city, Double latitude, Double longitude,
                           Integer totalRows, Integer seatsPerRow, ScreenType screenType, Integer capacity, Double distanceKm) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.totalRows = totalRows;
        this.seatsPerRow = seatsPerRow;
        this.screenType = screenType;
        this.capacity = capacity;
        this.distanceKm = distanceKm;
    }

    public static TheaterResponse fromEntity(Theater theater) {
        if (theater == null) {
            return null;
        }
        int cap = (theater.getTotalRows() != null && theater.getSeatsPerRow() != null)
                ? theater.getTotalRows() * theater.getSeatsPerRow()
                : 0;

        return new TheaterResponse(
                theater.getId(),
                theater.getName(),
                theater.getLocation(),
                theater.getCity(),
                theater.getLatitude(),
                theater.getLongitude(),
                theater.getTotalRows(),
                theater.getSeatsPerRow(),
                theater.getScreenType(),
                cap
        );
    }

    public static TheaterResponseBuilder builder() {
        return new TheaterResponseBuilder();
    }

    public static class TheaterResponseBuilder {
        private Long id;
        private String name;
        private String location;
        private String city;
        private Double latitude;
        private Double longitude;
        private Integer totalRows;
        private Integer seatsPerRow;
        private ScreenType screenType;
        private Integer capacity;
        private Double distanceKm;

        public TheaterResponseBuilder id(Long id) { this.id = id; return this; }
        public TheaterResponseBuilder name(String name) { this.name = name; return this; }
        public TheaterResponseBuilder location(String location) { this.location = location; return this; }
        public TheaterResponseBuilder city(String city) { this.city = city; return this; }
        public TheaterResponseBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public TheaterResponseBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public TheaterResponseBuilder totalRows(Integer totalRows) { this.totalRows = totalRows; return this; }
        public TheaterResponseBuilder seatsPerRow(Integer seatsPerRow) { this.seatsPerRow = seatsPerRow; return this; }
        public TheaterResponseBuilder screenType(ScreenType screenType) { this.screenType = screenType; return this; }
        public TheaterResponseBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public TheaterResponseBuilder distanceKm(Double distanceKm) { this.distanceKm = distanceKm; return this; }

        public TheaterResponse build() {
            return new TheaterResponse(id, name, location, city, latitude, longitude, totalRows, seatsPerRow, screenType, capacity, distanceKm);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    // Frontend compatibility accessors
    public String getAddress() {
        return (location != null ? location : "") + ", " + (city != null ? city : "Chennai");
    }

    public java.util.List<java.util.Map<String, Object>> getScreens() {
        String screenTypeName = "IMAX Laser";
        if (screenType != null) {
            screenTypeName = switch (screenType) {
                case IMAX -> "IMAX Laser";
                case DOLBY -> "Dolby Atmos 4K";
                case FOUR_DX -> "4DX Experience";
                case STANDARD -> "Standard Screen";
            };
        }
        int cap = capacity != null && capacity > 0 ? capacity : 96;
        return java.util.List.of(
                java.util.Map.of(
                        "id", "sc-" + id + "-1",
                        "name", "Screen 1 (" + screenTypeName + ")",
                        "type", screenTypeName,
                        "capacity", cap
                )
        );
    }
}
