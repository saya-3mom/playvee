package com.playvee.backend.park.model;

import com.playvee.backend.common.model.AbstractEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "park_photos")
public class ParkPhoto extends AbstractEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "park_id", nullable = false)
    private Park park;
    @Column(nullable = false, unique = true)
    private String storageKey;
    @Column(nullable = false)
    private String contentType;
    @Column(nullable = false)
    private long sizeBytes;

    protected ParkPhoto() {}

    public ParkPhoto(Park park, String storageKey, String contentType, long sizeBytes) {
        this.park = park;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
    }

    public String getStorageKey() { return storageKey; }
    public String getContentType() { return contentType; }
    public long getSizeBytes() { return sizeBytes; }
}
