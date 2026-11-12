package com.cineai.model.dto.request;

import com.cineai.model.enums.MovieStatus;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;

public class UpdateMovieRequest {

    private String title;
    private String description;
    private String genre;
    private String language;

    @Min(value = 1, message = "Duration must be greater than 0")
    private Integer durationMins;

    private String director;
    private String castInfo;
    private String posterUrl;
    private LocalDate releaseDate;
    private MovieStatus status;

    public UpdateMovieRequest() {}

    public UpdateMovieRequest(String title, String description, String genre, String language,
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
        this.status = status;
    }

    public static UpdateMovieRequestBuilder builder() {
        return new UpdateMovieRequestBuilder();
    }

    public static class UpdateMovieRequestBuilder {
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

        public UpdateMovieRequestBuilder title(String title) { this.title = title; return this; }
        public UpdateMovieRequestBuilder description(String description) { this.description = description; return this; }
        public UpdateMovieRequestBuilder genre(String genre) { this.genre = genre; return this; }
        public UpdateMovieRequestBuilder language(String language) { this.language = language; return this; }
        public UpdateMovieRequestBuilder durationMins(Integer durationMins) { this.durationMins = durationMins; return this; }
        public UpdateMovieRequestBuilder director(String director) { this.director = director; return this; }
        public UpdateMovieRequestBuilder castInfo(String castInfo) { this.castInfo = castInfo; return this; }
        public UpdateMovieRequestBuilder posterUrl(String posterUrl) { this.posterUrl = posterUrl; return this; }
        public UpdateMovieRequestBuilder releaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; return this; }
        public UpdateMovieRequestBuilder status(MovieStatus status) { this.status = status; return this; }

        public UpdateMovieRequest build() {
            return new UpdateMovieRequest(title, description, genre, language, durationMins, director, castInfo, posterUrl, releaseDate, status);
        }
    }

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
}
