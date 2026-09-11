package com.playvee.backend.park.controller;

import java.util.List;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import com.playvee.backend.park.dto.ParkCreateRequest;
import com.playvee.backend.park.dto.ParkCreateResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.playvee.backend.park.model.FacilityType;
import com.playvee.backend.park.dto.ParkFacilityResponse;
import com.playvee.backend.park.dto.ParkFacilityUpdateRequest;
import org.springframework.web.bind.annotation.PathVariable;
import com.playvee.backend.park.dto.ParkDetailResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.playvee.backend.park.dto.ParkListResponse;
import com.playvee.backend.park.service.ParkService;

@RestController
@RequestMapping("/api/parks")
public class ParkController {
    @PostMapping
    public ResponseEntity<ParkCreateResponse> createPark(@Valid @RequestBody ParkCreateRequest request) {
        var response = parkService.createPark(request);
        return ResponseEntity.created(URI.create("/api/parks/" + response.id())).body(response);
    }

    private final ParkService parkService;

    public ParkController(ParkService parkService) {
        this.parkService = parkService;
    }

    @GetMapping
    public List<ParkListResponse> getParks() {
        return parkService.getParks();
    }

    @GetMapping("/{id}")
    public ParkDetailResponse getPark(@PathVariable("id") Long id) {
        return parkService.getPark(id);
    }

    @PutMapping("/{parkId}/facilities/{facilityType}")
    public ParkFacilityResponse updateFacility(@PathVariable("parkId") Long parkId,
            @PathVariable("facilityType") FacilityType facilityType,
            @Valid @RequestBody ParkFacilityUpdateRequest request) {
        return parkService.updateFacility(parkId, facilityType, request);
    }
}
