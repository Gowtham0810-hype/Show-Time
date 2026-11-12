package com.cineai.model.dto.response;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(String token, String tokenType, UserDto user) {
        this.token = token;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.user = user;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String tokenType = "Bearer";
        private UserDto user;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public AuthResponseBuilder user(UserDto user) { this.user = user; return this; }

        public AuthResponse build() {
            if (user != null && token != null) {
                user.setToken(token);
            }
            return new AuthResponse(token, tokenType, user);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) {
        this.token = token;
        if (this.user != null) {
            this.user.setToken(token);
        }
    }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public UserDto getUser() {
        if (user != null && token != null && user.getToken() == null) {
            user.setToken(token);
        }
        return user;
    }
    public void setUser(UserDto user) {
        this.user = user;
        if (this.user != null && this.token != null) {
            this.user.setToken(this.token);
        }
    }
}
