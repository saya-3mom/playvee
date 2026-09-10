package com.playvee.backend.park.service;

import java.util.List;
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

    public ParkService(ParkRepository parkRepository) {
        this.parkRepository = parkRepository;
    }

    @Transactional(readOnly = true)
    public ParkDetailResponse getPark(Long id) {
        var park = parkRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new ParkDetailResponse(park.getId(), park.getName(), park.getAddress());
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
