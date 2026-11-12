package com.cineai.model.entity;

import com.cineai.model.enums.MovieStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovieStatus status = MovieStatus.UPCOMING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Movie() {}

    public Movie(Long id, String title, String description, String genre, String language,
                 Integer durationMins, String director, String castInfo, String posterUrl,
                 LocalDate releaseDate, MovieStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.genre = genre;
        this.language = language;
        this.durationMins = durationMins;
        this.director = director;
        this.castInfo = castInfo;
        this.posterUrl = posterUrl;
        this.releaseDate = releaseDate;
        this.status = status != null ? status : MovieStatus.UPCOMING;
        this.createdAt = createdAt;
    }

    public static MovieBuilder builder() {
        return new MovieBuilder();
    }

    public static class MovieBuilder {
        private Long id;
        private String title;
        private String description;
        private String genre;
        private String language;
        private Integer durationMins;
        private String director;
        private String castInfo;
        private String posterUrl;
        private LocalDate releaseDate;
        private MovieStatus status = MovieStatus.UPCOMING;
        private LocalDateTime createdAt;

        public MovieBuilder id(Long id) { this.id = id; return this; }
        public MovieBuilder title(String title) { this.title = title; return this; }
        public MovieBuilder description(String description) { this.description = description; return this; }
        public MovieBuilder genre(String genre) { this.genre = genre; return this; }
        public MovieBuilder language(String language) { this.language = language; return this; }
        public MovieBuilder durationMins(Integer durationMins) { this.durationMins = durationMins; return this; }
        public MovieBuilder director(String director) { this.director = director; return this; }
        public MovieBuilder castInfo(String castInfo) { this.castInfo = castInfo; return this; }
        public MovieBuilder posterUrl(String posterUrl) { this.posterUrl = posterUrl; return this; }
        public MovieBuilder releaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; return this; }
        public MovieBuilder status(MovieStatus status) { this.status = status; return this; }
        public MovieBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Movie build() {
            return new Movie(id, title, description, genre, language, durationMins, director, castInfo, posterUrl, releaseDate, status, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public Integer getDurationMins() { return durationMins; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }
    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }
    public String getCastInfo() { return castInfo; }
    public void setCastInfo(String castInfo) { this.castInfo = castInfo; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }
    public MovieStatus getStatus() { return status; }
    public void setStatus(MovieStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
