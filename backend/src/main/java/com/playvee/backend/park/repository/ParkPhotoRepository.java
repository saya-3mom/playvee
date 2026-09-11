package com.playvee.backend.park.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.playvee.backend.park.model.ParkPhoto;

public interface ParkPhotoRepository extends JpaRepository<ParkPhoto, Long> {
    List<ParkPhoto> findByPark_IdAndDeletedAtIsNullOrderByIdAsc(Long parkId);
    Optional<ParkPhoto> findByIdAndPark_IdAndDeletedAtIsNullAndPark_DeletedAtIsNull(Long id, Long parkId);
}
