package com.cineai.model.dto.request;

import com.cineai.model.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @JsonAlias({"name", "fullName"})
    private String fullName;

    private UserRole role;

    public RegisterRequest() {}

    public RegisterRequest(String email, String password, String fullName, UserRole role) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
    }

    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }

    public static class RegisterRequestBuilder {
        private String email;
        private String password;
        private String fullName;
        private UserRole role;

        public RegisterRequestBuilder email(String email) { this.email = email; return this; }
        public RegisterRequestBuilder password(String password) { this.password = password; return this; }
        public RegisterRequestBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public RegisterRequestBuilder role(UserRole role) { this.role = role; return this; }

        public RegisterRequest build() {
            return new RegisterRequest(email, password, fullName, role);
        }
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setName(String name) { if (this.fullName == null || this.fullName.isBlank()) this.fullName = name; }
    public String getName() { return fullName; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
}
