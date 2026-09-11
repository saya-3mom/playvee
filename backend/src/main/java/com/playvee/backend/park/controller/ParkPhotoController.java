package com.playvee.backend.park.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.playvee.backend.park.dto.ParkPhotoResponse;
import com.playvee.backend.park.service.ParkPhotoService;

@RestController
@RequestMapping("/api/parks/{parkId}/photos")
public class ParkPhotoController {
    private final ParkPhotoService service;
    public ParkPhotoController(ParkPhotoService service) { this.service = service; }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ParkPhotoResponse upload(@PathVariable("parkId") Long parkId,
            @RequestParam("file") MultipartFile file) {
        return service.upload(parkId, file);
    }

    @GetMapping("/{photoId}/image")
    public ResponseEntity<FileSystemResource> image(@PathVariable("parkId") Long parkId,
            @PathVariable("photoId") Long photoId) {
        return service.image(parkId, photoId);
    }
}
