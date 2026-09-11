package com.playvee.backend.park.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public record ParkCreateRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 500) String address,
        @DecimalMin("-90") @DecimalMax("90") @Digits(integer = 3, fraction = 6) BigDecimal latitude,
        @DecimalMin("-180") @DecimalMax("180") @Digits(integer = 3, fraction = 6) BigDecimal longitude) {
    public ParkCreateRequest {
        name = name == null ? null : name.strip();
        address = address == null ? null : address.strip();
    }
}
