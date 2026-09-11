package com.playvee.backend.park.repository;

import java.util.List;
import java.util.Optional;
import com.playvee.backend.park.model.FacilityType;

import org.springframework.data.jpa.repository.JpaRepository;

import com.playvee.backend.park.model.ParkFacility;

public interface ParkFacilityRepository extends JpaRepository<ParkFacility, Long> {
    Optional<ParkFacility> findByPark_IdAndFacilityType(Long parkId, FacilityType facilityType);
    List<ParkFacility> findByPark_IdAndDeletedAtIsNull(Long parkId);
}
