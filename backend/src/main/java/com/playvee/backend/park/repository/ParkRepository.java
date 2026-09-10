package com.playvee.backend.park.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.playvee.backend.park.model.Park;

public interface ParkRepository extends JpaRepository<Park, Long> {

    List<Park> findByDeletedAtIsNullOrderByIdAsc();
    Optional<Park> findByIdAndDeletedAtIsNull(Long id);
}
