package com.playvee.backend.park.model;

import java.time.LocalDate;

import com.playvee.backend.common.model.AbstractEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "park_facilities", uniqueConstraints = @UniqueConstraint(
        name = "uk_park_facility_type", columnNames = {"park_id", "facility_type"}))
public class ParkFacility extends AbstractEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "park_id", nullable = false)
    private Park park;

    @Enumerated(EnumType.STRING)
    @Column(name = "facility_type", nullable = false, length = 32)
    private FacilityType facilityType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private FacilityStatus status;

    @Column(name = "last_checked_on")
    private LocalDate lastCheckedOn;

    protected ParkFacility() {
    }

    public ParkFacility(Park park, FacilityType facilityType, FacilityStatus status,
            LocalDate lastCheckedOn) {
        this.park = park;
        this.facilityType = facilityType;
        this.status = status;
        this.lastCheckedOn = lastCheckedOn;
    }

    public FacilityType getFacilityType() {
        return facilityType;
    }

    public void update(FacilityStatus status, LocalDate lastCheckedOn) {
        this.status = status;
        this.lastCheckedOn = lastCheckedOn;
    }

    public FacilityStatus getStatus() {
        return status;
    }

    public LocalDate getLastCheckedOn() {
        return lastCheckedOn;
    }
}
