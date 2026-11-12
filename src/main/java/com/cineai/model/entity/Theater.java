package com.cineai.model.entity;

import com.cineai.model.enums.ScreenType;
import com.cineai.model.enums.ScreenTypeConverter;
import jakarta.persistence.*;

@Entity
@Table(name = "theaters")
public class Theater {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, length = 100)
    private String city;

    private Double latitude;

    private Double longitude;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "seats_per_row", nullable = false)
    private Integer seatsPerRow;

    @Convert(converter = ScreenTypeConverter.class)
    @Column(name = "screen_type", length = 50)
    private ScreenType screenType = ScreenType.STANDARD;

    public Theater() {}

    public Theater(Long id, String name, String location, String city, Double latitude, Double longitude,
                   Integer totalRows, Integer seatsPerRow, ScreenType screenType) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.totalRows = totalRows;
        this.seatsPerRow = seatsPerRow;
        this.screenType = screenType != null ? screenType : ScreenType.STANDARD;
    }

    public static TheaterBuilder builder() {
        return new TheaterBuilder();
    }

    public static class TheaterBuilder {
        private Long id;
        private String name;
        private String location;
        private String city;
        private Double latitude;
        private Double longitude;
        private Integer totalRows;
        private Integer seatsPerRow;
        private ScreenType screenType = ScreenType.STANDARD;

        public TheaterBuilder id(Long id) { this.id = id; return this; }
        public TheaterBuilder name(String name) { this.name = name; return this; }
        public TheaterBuilder location(String location) { this.location = location; return this; }
        public TheaterBuilder city(String city) { this.city = city; return this; }
        public TheaterBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public TheaterBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public TheaterBuilder totalRows(Integer totalRows) { this.totalRows = totalRows; return this; }
        public TheaterBuilder seatsPerRow(Integer seatsPerRow) { this.seatsPerRow = seatsPerRow; return this; }
        public TheaterBuilder screenType(ScreenType screenType) { this.screenType = screenType; return this; }

        public Theater build() {
            return new Theater(id, name, location, city, latitude, longitude, totalRows, seatsPerRow, screenType);
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
}
