package com.cineai.repository;

import com.cineai.model.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {

    List<Theater> findByCityIgnoreCase(String city);

    boolean existsByNameAndLocation(String name, String location);

    @Query(value = """
        SELECT t.*,
            (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(t.latitude)) *
                    cos(radians(t.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(t.latitude))
                ))
            )) AS distance_km
        FROM theaters t
        WHERE (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(t.latitude)) *
                    cos(radians(t.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(t.latitude))
                ))
            )) <= :radiusKm
        ORDER BY distance_km ASC
    """, nativeQuery = true)
    List<Object[]> findTheatersWithinRadius(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm
    );

    @Query(value = """
        SELECT DISTINCT t.*,
            (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(t.latitude)) *
                    cos(radians(t.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(t.latitude))
                ))
            )) AS distance_km
        FROM theaters t
        JOIN showtimes s ON s.theater_id = t.id
        WHERE s.movie_id = :movieId
          AND (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(t.latitude)) *
                    cos(radians(t.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(t.latitude))
                ))
            )) <= :radiusKm
        ORDER BY distance_km ASC
    """, nativeQuery = true)
    List<Object[]> findTheatersShowingMovieWithinRadius(
        @Param("movieId") Long movieId,
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm
    );

    @Query(value = """
        SELECT DISTINCT t.*,
            (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(t.latitude)) *
                    cos(radians(t.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(t.latitude))
                ))
            )) AS distance_km
        FROM theaters t
        JOIN showtimes s ON s.theater_id = t.id
        WHERE s.movie_id = :movieId
          AND s.show_date = :showDate
          AND (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(t.latitude)) *
                    cos(radians(t.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(t.latitude))
                ))
            )) <= :radiusKm
        ORDER BY distance_km ASC
    """, nativeQuery = true)
    List<Object[]> findTheatersShowingMovieWithinRadiusOnDate(
        @Param("movieId") Long movieId,
        @Param("showDate") LocalDate showDate,
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm
    );

    @Query("""
        SELECT DISTINCT s.theater
        FROM Showtime s
        WHERE s.movie.id = :movieId
    """)
    List<Theater> findTheatersShowingMovie(@Param("movieId") Long movieId);

    @Query("""
        SELECT DISTINCT s.theater
        FROM Showtime s
        WHERE s.movie.id = :movieId
          AND s.showDate = :showDate
    """)
    List<Theater> findTheatersShowingMovieOnDate(
        @Param("movieId") Long movieId,
        @Param("showDate") LocalDate showDate
    );

    default List<Theater> findTheatersShowingMovie(Long movieId, LocalDate showDate) {
        return showDate != null ? findTheatersShowingMovieOnDate(movieId, showDate) : findTheatersShowingMovie(movieId);
    }
}

