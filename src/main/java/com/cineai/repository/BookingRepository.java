package com.cineai.repository;

import com.cineai.model.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);

    Optional<Booking> findByBookingRef(String bookingRef);

    boolean existsByBookingRef(String bookingRef);
}
