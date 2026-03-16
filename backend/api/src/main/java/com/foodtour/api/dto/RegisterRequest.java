package com.foodtour.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    // Only USER or OWNER allowed for self-registration
    @NotBlank(message = "Role cannot be blank")
    @Pattern(regexp = "USER|OWNER", message = "Role must be USER or OWNER")
    private String role;
}
