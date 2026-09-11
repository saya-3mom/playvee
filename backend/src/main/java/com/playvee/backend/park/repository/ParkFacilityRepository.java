package com.playvee.backend.park.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.playvee.backend.park.model.ParkFacility;

public interface ParkFacilityRepository extends JpaRepository<ParkFacility, Long> {
    List<ParkFacility> findByPark_IdAndDeletedAtIsNull(Long parkId);
}
