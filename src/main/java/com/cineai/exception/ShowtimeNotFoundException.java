package com.cineai.exception;

public class ShowtimeNotFoundException extends ResourceNotFoundException {
    public ShowtimeNotFoundException(String message) {
        super(message);
    }
}
