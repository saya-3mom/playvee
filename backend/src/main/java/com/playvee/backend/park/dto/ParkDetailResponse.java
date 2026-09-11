package com.playvee.backend.park.dto;

import java.util.List;
import java.math.BigDecimal;

public record ParkDetailResponse(Long id, String name, String address,
        BigDecimal latitude, BigDecimal longitude,
        List<ParkFacilityResponse> facilities, List<ParkPhotoResponse> photos) {
}
