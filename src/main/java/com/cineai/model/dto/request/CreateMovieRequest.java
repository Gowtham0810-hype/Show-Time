package com.cineai.model.dto.request;

import com.cineai.model.enums.MovieStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateMovieRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @JsonAlias("synopsis")
    private String description;

    @JsonAlias("genres")
    private String genre;

    private String language;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be greater than 0")
    @JsonAlias("runtimeMinutes")
    private Integer durationMins;

    private String director;

    @JsonAlias("cast")
    private String castInfo;

    private String posterUrl;
    private LocalDate releaseDate;
    private MovieStatus status = MovieStatus.NOW_SHOWING;

    public CreateMovieRequest() {}

    public CreateMovieRequest(String title, String description, String genre, String language,
                              Integer durationMins, String director, String castInfo, String posterUrl,
                              LocalDate releaseDate, MovieStatus status) {
        this.title = title;
        this.description = description;
        this.genre = genre;
        this.language = language;
        this.durationMins = durationMins;
        this.director = director;
        this.castInfo = castInfo;
        this.posterUrl = posterUrl;
        this.releaseDate = releaseDate;
        this.status = status != null ? status : MovieStatus.NOW_SHOWING;
    }

    public static CreateMovieRequestBuilder builder() {
        return new CreateMovieRequestBuilder();
    }

    public static class CreateMovieRequestBuilder {
        private String title;
        private String description;
        private String genre;
        private String language;
        private Integer durationMins;
        private String director;
        private String castInfo;
        private String posterUrl;
        private LocalDate releaseDate;
        private MovieStatus status = MovieStatus.NOW_SHOWING;

        public CreateMovieRequestBuilder title(String title) { this.title = title; return this; }
        public CreateMovieRequestBuilder description(String description) { this.description = description; return this; }
        public CreateMovieRequestBuilder genre(String genre) { this.genre = genre; return this; }
        public CreateMovieRequestBuilder language(String language) { this.language = language; return this; }
        public CreateMovieRequestBuilder durationMins(Integer durationMins) { this.durationMins = durationMins; return this; }
        public CreateMovieRequestBuilder director(String director) { this.director = director; return this; }
        public CreateMovieRequestBuilder castInfo(String castInfo) { this.castInfo = castInfo; return this; }
        public CreateMovieRequestBuilder posterUrl(String posterUrl) { this.posterUrl = posterUrl; return this; }
        public CreateMovieRequestBuilder releaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; return this; }
        public CreateMovieRequestBuilder status(MovieStatus status) { this.status = status; return this; }

        public CreateMovieRequest build() {
            return new CreateMovieRequest(title, description, genre, language, durationMins, director, castInfo, posterUrl, releaseDate, status);
        }
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public void setSynopsis(String synopsis) { if (this.description == null || this.description.isBlank()) this.description = synopsis; }
    public String getGenre() { return genre; }
    public void setGenre(Object g) {
        if (g instanceof java.util.List<?> list) {
            this.genre = list.stream().map(Object::toString).collect(java.util.stream.Collectors.joining(", "));
        } else if (g != null) {
            this.genre = g.toString();
        }
    }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public Integer getDurationMins() { return durationMins; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }
    public void setRuntimeMinutes(Integer runtimeMinutes) { this.durationMins = runtimeMinutes; }
    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }
    public String getCastInfo() { return castInfo; }
    public void setCast(Object c) {
        if (c instanceof java.util.List<?> list) {
            this.castInfo = list.stream().map(Object::toString).collect(java.util.stream.Collectors.joining(", "));
        } else if (c != null) {
            this.castInfo = c.toString();
        }
    }
    public void setCastInfo(String castInfo) { this.castInfo = castInfo; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }
    public MovieStatus getStatus() { return status; }
    public void setStatus(MovieStatus status) { this.status = status; }
    public void setIsNowShowing(Boolean showing) {
        if (Boolean.TRUE.equals(showing)) this.status = MovieStatus.NOW_SHOWING;
    }
    public void setIsUpcoming(Boolean upcoming) {
        if (Boolean.TRUE.equals(upcoming) && this.status != MovieStatus.NOW_SHOWING) this.status = MovieStatus.UPCOMING;
    }
}
