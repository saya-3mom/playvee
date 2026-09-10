package com.playvee.backend.park.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.playvee.backend.park.dto.ParkListResponse;
import com.playvee.backend.park.service.ParkService;

@RestController
@RequestMapping("/api/parks")
public class ParkController {

    private final ParkService parkService;

    public ParkController(ParkService parkService) {
        this.parkService = parkService;
    }

    @GetMapping
    public List<ParkListResponse> getParks() {
        return parkService.getParks();
    }
}
