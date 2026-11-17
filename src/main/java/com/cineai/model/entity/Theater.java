package com.cineai.model.entity;

import com.cineai.model.enums.ScreenType;
import com.cineai.model.enums.ScreenTypeConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter 
@Setter 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
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

    @Builder.Default
    @Convert(converter = ScreenTypeConverter.class)
    @Column(name = "screen_type", length = 50)
    private ScreenType screenType = ScreenType.STANDARD;
}
