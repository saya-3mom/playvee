package com.playvee.backend.park.dto;

import java.time.LocalDate;
import com.playvee.backend.park.model.FacilityStatus;
import jakarta.validation.constraints.NotNull;

public record ParkFacilityUpdateRequest(@NotNull FacilityStatus status, LocalDate lastCheckedOn) {
}
