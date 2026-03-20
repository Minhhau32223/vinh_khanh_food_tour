package com.foodtour.api.dto.Tour;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTourRequest {
    @NotBlank(message = "Username cannot be blank")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private Boolean isSystem = false;

    private Long createdBy;
}

