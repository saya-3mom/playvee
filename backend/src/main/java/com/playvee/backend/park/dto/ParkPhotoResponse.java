package com.playvee.backend.park.dto;

public record ParkPhotoResponse(Long id, String url) {
    public static ParkPhotoResponse of(Long parkId, Long photoId) {
        return new ParkPhotoResponse(photoId, "/api/parks/" + parkId + "/photos/" + photoId + "/image");
    }
}
