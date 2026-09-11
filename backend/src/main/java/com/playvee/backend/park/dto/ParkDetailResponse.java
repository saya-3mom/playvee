package com.playvee.backend.park.dto;

import java.util.List;

public record ParkDetailResponse(Long id, String name, String address,
        List<ParkFacilityResponse> facilities, List<ParkPhotoResponse> photos) {
}
