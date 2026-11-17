package com.cineai.model.entity;

import com.cineai.model.enums.AlertStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter 
@Setter 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor 
@Table(name = "movie_alerts", indexes = {
    @Index(name = "idx_movie_alerts_status", columnList = "status"),
    @Index(name = "idx_movie_alerts_movie_title", columnList = "movie_title")
})
public class MovieAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "movie_title", nullable = false)
    private String movieTitle;

    @Column(name = "theater_name")
    private String theaterName;

    @Column(length = 100)
    private String city;

    @Column(name = "screen_type", length = 50)
    private String screenType;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status = AlertStatus.ACTIVE;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


}
