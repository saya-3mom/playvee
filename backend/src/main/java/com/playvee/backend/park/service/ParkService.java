package com.playvee.backend.park.service;

import java.util.List;
import com.playvee.backend.park.repository.ParkPhotoRepository;
import com.playvee.backend.park.dto.ParkPhotoResponse;
import com.playvee.backend.park.dto.ParkFacilityUpdateRequest;
import java.util.Arrays;
import java.util.EnumMap;
import com.playvee.backend.park.dto.ParkFacilityResponse;
import com.playvee.backend.park.model.FacilityType;
import com.playvee.backend.park.model.FacilityStatus;
import com.playvee.backend.park.model.ParkFacility;
import com.playvee.backend.park.repository.ParkFacilityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.playvee.backend.park.dto.ParkDetailResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.playvee.backend.park.dto.ParkListResponse;
import com.playvee.backend.park.repository.ParkRepository;

@Service
public class ParkService {

    private final ParkRepository parkRepository;
    private final ParkPhotoRepository parkPhotoRepository;
    private final ParkFacilityRepository parkFacilityRepository;

    public ParkService(ParkRepository parkRepository, ParkFacilityRepository parkFacilityRepository,
            ParkPhotoRepository parkPhotoRepository) {
        this.parkPhotoRepository = parkPhotoRepository;
        this.parkRepository = parkRepository;
        this.parkFacilityRepository = parkFacilityRepository;
    }

    @Transactional(readOnly = true)
    public ParkDetailResponse getPark(Long id) {
        var park = parkRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var byType = new EnumMap<FacilityType, ParkFacility>(FacilityType.class);
        parkFacilityRepository.findByPark_IdAndDeletedAtIsNull(id)
                .forEach(facility -> byType.put(facility.getFacilityType(), facility));
        var facilities = Arrays.stream(FacilityType.values())
                .map(type -> {
                    var facility = byType.get(type);
                    return facility == null
                            ? new ParkFacilityResponse(type, FacilityStatus.UNKNOWN, null)
                            : new ParkFacilityResponse(type, facility.getStatus(), facility.getLastCheckedOn());
                }).toList();
        var photos = parkPhotoRepository.findByPark_IdAndDeletedAtIsNullOrderByIdAsc(id).stream()
                .map(photo -> ParkPhotoResponse.of(id, photo.getId())).toList();
        return new ParkDetailResponse(park.getId(), park.getName(), park.getAddress(),
                park.getLatitude(), park.getLongitude(), facilities, photos);
    }

    @Transactional
    public ParkFacilityResponse updateFacility(Long parkId, FacilityType type,
            ParkFacilityUpdateRequest request) {
        var park = parkRepository.findByIdAndDeletedAtIsNull(parkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var facility = parkFacilityRepository.findByPark_IdAndFacilityType(parkId, type)
                .orElseGet(() -> new ParkFacility(park, type, request.status(), request.lastCheckedOn()));
        facility.restore();
        facility.update(request.status(), request.lastCheckedOn());
        var saved = parkFacilityRepository.save(facility);
        return new ParkFacilityResponse(saved.getFacilityType(), saved.getStatus(), saved.getLastCheckedOn());
    }

    @Transactional(readOnly = true)
    public List<ParkListResponse> getParks() {
        return parkRepository.findByDeletedAtIsNullOrderByIdAsc()
                .stream()
                .map(park -> new ParkListResponse(
                        park.getId(), park.getName(), park.getAddress()))
                .toList();
    }
}
