package com.lifeos.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordResetRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    public PasswordResetRequest() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
