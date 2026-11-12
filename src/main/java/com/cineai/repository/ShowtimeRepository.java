package com.cineai.repository;

import com.cineai.model.entity.Showtime;
import com.cineai.model.enums.ShowtimeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovieId(Long movieId);

    List<Showtime> findByMovieIdAndTheaterId(Long movieId, Long theaterId);

    List<Showtime> findByMovieIdAndShowDate(Long movieId, LocalDate showDate);

    List<Showtime> findByTheaterIdAndShowDate(Long theaterId, LocalDate showDate);

    List<Showtime> findByStatus(ShowtimeStatus status);

    boolean existsByTheaterIdAndShowDateAndShowTime(Long theaterId, LocalDate showDate, LocalTime showTime);

    @Query("SELECT s FROM Showtime s JOIN s.movie m JOIN s.theater t " +
           "WHERE LOWER(m.title) LIKE :moviePattern " +
           "AND (:theaterPattern IS NULL OR LOWER(t.name) LIKE :theaterPattern) " +
           "AND (:cityPattern IS NULL OR LOWER(t.city) LIKE :cityPattern) " +
           "AND (:createdAfter IS NULL OR s.createdAt >= :createdAfter) " +
           "AND s.status = com.cineai.model.enums.ShowtimeStatus.ACTIVE")
    List<Showtime> findMatchingShowtimes(
        @Param("moviePattern") String moviePattern,
        @Param("theaterPattern") String theaterPattern,
        @Param("cityPattern") String cityPattern,
        @Param("createdAfter") LocalDateTime createdAfter
    );
}
