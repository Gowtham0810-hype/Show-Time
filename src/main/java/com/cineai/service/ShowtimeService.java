package com.cineai.service;

import com.cineai.exception.ShowtimeNotFoundException;
import com.cineai.model.dto.response.ShowtimeResponse;
import com.cineai.model.dto.response.TheaterResponse;
import com.cineai.model.entity.Showtime;
import com.cineai.model.entity.Theater;
import com.cineai.model.enums.ScreenType;
import com.cineai.model.enums.SeatStatus;
import com.cineai.repository.SeatRepository;
import com.cineai.repository.ShowtimeRepository;
import com.cineai.repository.TheaterRepository;
import com.cineai.util.DistanceUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final TheaterRepository theaterRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository,
                           SeatRepository seatRepository,
                           TheaterRepository theaterRepository) {
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.theaterRepository = theaterRepository;
    }

    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ShowtimeNotFoundException("Showtime not found with id: " + id));

        ShowtimeResponse response = ShowtimeResponse.fromEntity(showtime);
        int totalSeats = (int) seatRepository.countByShowtimeId(id);
        int availableSeats = seatRepository.findByShowtimeIdAndStatus(id, SeatStatus.AVAILABLE).size();
        response.setTotalSeats(totalSeats);
        response.setAvailableSeats(availableSeats);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> queryShowtimes(Long movieId, LocalDate date, String city) {
        List<Showtime> showtimes = showtimeRepository.findAll();

        return showtimes.stream()
                .filter(s -> movieId == null || (s.getMovie() != null && s.getMovie().getId().equals(movieId)))
                .filter(s -> date == null || s.getShowDate().equals(date))
                .filter(s -> city == null || (s.getTheater() != null && s.getTheater().getCity().equalsIgnoreCase(city.trim())))
                .map(s -> {
                    ShowtimeResponse res = ShowtimeResponse.fromEntity(s);
                    int totalSeats = (int) seatRepository.countByShowtimeId(s.getId());
                    int availableSeats = seatRepository.findByShowtimeIdAndStatus(s.getId(), SeatStatus.AVAILABLE).size();
                    res.setTotalSeats(totalSeats);
                    res.setAvailableSeats(availableSeats);
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TheaterResponse> findTheatersShowingMovie(Long movieId, LocalDate date, Double userLat, Double userLng) {
        List<TheaterResponse> result = new ArrayList<>();

        if (userLat != null && userLng != null) {
            try {
                List<Object[]> rows = (date != null)
                        ? theaterRepository.findTheatersShowingMovieWithinRadiusOnDate(movieId, date, userLat, userLng, 50.0)
                        : theaterRepository.findTheatersShowingMovieWithinRadius(movieId, userLat, userLng, 50.0);
                for (Object[] row : rows) {
                    Long id = ((Number) row[0]).longValue();
                    String name = (String) row[1];
                    String location = (String) row[2];
                    String city = (String) row[3];
                    Double lat = row[4] != null ? ((Number) row[4]).doubleValue() : null;
                    Double lng = row[5] != null ? ((Number) row[5]).doubleValue() : null;
                    Integer totalRows = row[6] != null ? ((Number) row[6]).intValue() : 0;
                    Integer seatsPerRow = row[7] != null ? ((Number) row[7]).intValue() : 0;
                    String screenTypeVal = (String) row[8];
                    Double dist = row[9] != null ? ((Number) row[9]).doubleValue() : null;

                    ScreenType st = ScreenType.fromValue(screenTypeVal);
                    TheaterResponse tr = new TheaterResponse(id, name, location, city, lat, lng, totalRows, seatsPerRow, st, totalRows * seatsPerRow);
                    tr.setDistanceKm(dist != null ? Math.round(dist * 10.0) / 10.0 : null);
                    result.add(tr);
                }
            } catch (Exception ignored) {
                // Fallback to in-memory calculation if native acos query is unsupported in test DB
            }
        }

        if (result.isEmpty()) {
            List<Theater> theaters = theaterRepository.findTheatersShowingMovie(movieId, date);
            for (Theater t : theaters) {
                TheaterResponse tr = TheaterResponse.fromEntity(t);
                if (userLat != null && userLng != null && t.getLatitude() != null && t.getLongitude() != null) {
                    double dist = DistanceUtil.haversineDistanceKm(userLat, userLng, t.getLatitude(), t.getLongitude());
                    tr.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                }
                result.add(tr);
            }
            if (userLat != null && userLng != null) {
                result.sort((a, b) -> {
                    if (a.getDistanceKm() == null) return 1;
                    if (b.getDistanceKm() == null) return -1;
                    return Double.compare(a.getDistanceKm(), b.getDistanceKm());
                });
            }
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> findShowtimes(Long movieId, Long theaterId, LocalDate date) {
        List<Showtime> showtimes = showtimeRepository.findByMovieIdAndTheaterId(movieId, theaterId);

        return showtimes.stream()
                .filter(s -> date == null || s.getShowDate().equals(date))
                .map(s -> {
                    ShowtimeResponse res = ShowtimeResponse.fromEntity(s);
                    int total = (int) seatRepository.countByShowtimeId(s.getId());
                    int avail = seatRepository.findByShowtimeIdAndStatus(s.getId(), SeatStatus.AVAILABLE).size();
                    res.setTotalSeats(total);
                    res.setAvailableSeats(avail);
                    return res;
                })
                .collect(Collectors.toList());
    }
}

