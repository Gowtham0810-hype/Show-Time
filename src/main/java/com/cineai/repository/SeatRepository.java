package com.cineai.repository;

import com.cineai.model.entity.Seat;
import com.cineai.model.enums.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByShowtimeId(Long showtimeId);

    List<Seat> findByShowtimeIdAndStatus(Long showtimeId, SeatStatus status);

    Optional<Seat> findByShowtimeIdAndSeatRowAndSeatNumber(Long showtimeId, String seatRow, Integer seatNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id IN :ids")
    List<Seat> findByIdsWithLock(@Param("ids") List<Long> ids);

    long countByShowtimeId(Long showtimeId);

    void deleteByShowtimeId(Long showtimeId);
}
