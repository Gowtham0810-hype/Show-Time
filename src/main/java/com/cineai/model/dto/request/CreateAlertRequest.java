package com.cineai.model.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateAlertRequest {

    @NotBlank(message = "Movie title is required")
    private String movieTitle;

    private String theaterName;

    private String city;

    private String screenType;

    private String movieId;

    private String userEmail;

    private String notes;

    public CreateAlertRequest() {}

    public CreateAlertRequest(String movieTitle, String theaterName, String city, String screenType) {
        this.movieTitle = movieTitle;
        this.theaterName = theaterName;
        this.city = city;
        this.screenType = screenType;
    }

    public String getMovieId() { return movieId; }
    public void setMovieId(String movieId) { this.movieId = movieId; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }

    public String getTheaterName() {
        return theaterName;
    }

    public void setTheaterName(String theaterName) {
        this.theaterName = theaterName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getScreenType() {
        return screenType;
    }

    public void setScreenType(String screenType) {
        this.screenType = screenType;
    }
}
