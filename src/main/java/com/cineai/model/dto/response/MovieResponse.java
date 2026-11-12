package com.cineai.model.dto.response;

import com.cineai.model.entity.Movie;
import com.cineai.model.enums.MovieStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class MovieResponse {

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
    private MovieStatus status;
    private LocalDateTime createdAt;

    public MovieResponse() {}

    public MovieResponse(Long id, String title, String description, String genre, String language,
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
        this.status = status;
        this.createdAt = createdAt;
    }

    public static MovieResponse fromEntity(Movie movie) {
        if (movie == null) {
            return null;
        }
        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getGenre(),
                movie.getLanguage(),
                movie.getDurationMins(),
                movie.getDirector(),
                movie.getCastInfo(),
                movie.getPosterUrl(),
                movie.getReleaseDate(),
                movie.getStatus(),
                movie.getCreatedAt()
        );
    }

    public static MovieResponseBuilder builder() {
        return new MovieResponseBuilder();
    }

    public static class MovieResponseBuilder {
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
        private MovieStatus status;
        private LocalDateTime createdAt;

        public MovieResponseBuilder id(Long id) { this.id = id; return this; }
        public MovieResponseBuilder title(String title) { this.title = title; return this; }
        public MovieResponseBuilder description(String description) { this.description = description; return this; }
        public MovieResponseBuilder genre(String genre) { this.genre = genre; return this; }
        public MovieResponseBuilder language(String language) { this.language = language; return this; }
        public MovieResponseBuilder durationMins(Integer durationMins) { this.durationMins = durationMins; return this; }
        public MovieResponseBuilder director(String director) { this.director = director; return this; }
        public MovieResponseBuilder castInfo(String castInfo) { this.castInfo = castInfo; return this; }
        public MovieResponseBuilder posterUrl(String posterUrl) { this.posterUrl = posterUrl; return this; }
        public MovieResponseBuilder releaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; return this; }
        public MovieResponseBuilder status(MovieStatus status) { this.status = status; return this; }
        public MovieResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public MovieResponse build() {
            return new MovieResponse(id, title, description, genre, language, durationMins, director, castInfo, posterUrl, releaseDate, status, createdAt);
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

    // Frontend compatibility accessors
    public String getSynopsis() { return description; }
    public void setSynopsis(String synopsis) { this.description = synopsis; }

    public Integer getRuntimeMinutes() { return durationMins; }
    public void setRuntimeMinutes(Integer runtimeMinutes) { this.durationMins = runtimeMinutes; }

    public boolean getIsNowShowing() { return status == MovieStatus.NOW_SHOWING; }
    public boolean getIsUpcoming() { return status == MovieStatus.UPCOMING; }

    public List<String> getGenres() {
        if (genre == null || genre.isBlank()) return java.util.List.of();
        return java.util.Arrays.stream(genre.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
    }

    public List<String> getCast() {
        if (castInfo == null || castInfo.isBlank()) return java.util.List.of();
        return java.util.Arrays.stream(castInfo.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
    }

    public String getSlug() {
        return title != null ? title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "") : "";
    }

    public String getOriginalTitle() { return title; }
    public String getCertification() { return "UA"; }
    public Double getRating() { return 8.5; }
    public String getBackdropUrl() { return posterUrl; }
    public List<String> getStillImages() { return java.util.List.of(); }
}
