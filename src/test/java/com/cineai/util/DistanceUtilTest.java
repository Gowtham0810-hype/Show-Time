package com.cineai.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DistanceUtilTest {

    @Test
    void shouldCalculateAccurateDistanceBetweenCoordinates() {
        // Bangalore (12.9716, 77.5946) to Chennai (13.0827, 80.2707) is approx 290 - 300 km
        double distance = DistanceUtil.haversineDistanceKm(12.9716, 77.5946, 13.0827, 80.2707);
        assertTrue(distance > 280 && distance < 310, "Distance should be approx 290-300km, was: " + distance);
    }

    @Test
    void shouldReturnZeroForIdenticalPoints() {
        double distance = DistanceUtil.haversineDistanceKm(12.9716, 77.5946, 12.9716, 77.5946);
        assertTrue(distance < 0.001);
    }
}
