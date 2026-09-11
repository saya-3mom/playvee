package com.playvee.backend.park.model;
import java.math.BigDecimal;

import com.playvee.backend.common.model.AbstractEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "parks")
public class Park extends AbstractEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 6)
    private BigDecimal longitude;

    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }

    protected Park() {
    }

    public Park(String name, String address) {
        this.name = name;
        this.address = address;
    }

    public Park(String name, String address, BigDecimal latitude, BigDecimal longitude) {
        this(name, address);
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }
}
