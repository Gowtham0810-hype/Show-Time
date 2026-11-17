package com.cineai.model.entity;

import com.cineai.model.enums.SeatCategory;
import com.cineai.model.enums.SeatStatus;
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
@NoArgsConstructor 
@AllArgsConstructor 
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

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_category", length = 20)
    private SeatCategory seatCategory = SeatCategory.REGULAR;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Builder.Default
    @Version
    @Column(nullable = false)
    private Long version = 0L;

}
