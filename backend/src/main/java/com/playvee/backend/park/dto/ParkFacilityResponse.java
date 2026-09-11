package com.playvee.backend.park.dto;

import java.time.LocalDate;

import com.playvee.backend.park.model.FacilityStatus;
import com.playvee.backend.park.model.FacilityType;

public record ParkFacilityResponse(FacilityType type, FacilityStatus status, LocalDate lastCheckedOn) {
}
