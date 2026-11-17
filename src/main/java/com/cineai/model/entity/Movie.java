package com.cineai.model.entity;

import com.cineai.model.enums.MovieStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter 
@Setter 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor 
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String genre;

    @Column(length = 50)
    private String language;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    private String director;

    @Column(name = "cast_info", columnDefinition = "TEXT")
    private String castInfo;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovieStatus status = MovieStatus.UPCOMING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    
}
