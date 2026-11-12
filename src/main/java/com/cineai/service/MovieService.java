package com.cineai.service;

import com.cineai.exception.ResourceNotFoundException;
import com.cineai.model.dto.response.MovieResponse;
import com.cineai.model.dto.response.ShowtimeResponse;
import com.cineai.model.entity.Movie;
import com.cineai.model.entity.Showtime;
import com.cineai.model.enums.MovieStatus;
import com.cineai.repository.MovieRepository;
import com.cineai.repository.SeatRepository;
import com.cineai.repository.ShowtimeRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    public MovieService(MovieRepository movieRepository,
                        ShowtimeRepository showtimeRepository,
                        SeatRepository seatRepository) {
        this.movieRepository = movieRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
    }

    @Transactional(readOnly = true)
    public List<MovieResponse> getMovies(MovieStatus status, String genre, String search) {
        String cleanGenre = (genre != null && !genre.isBlank()) ? genre.trim().toLowerCase() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;

        Specification<Movie> spec = Specification.where(null);

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (cleanGenre != null) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("genre")), "%" + cleanGenre + "%"));
        }
        if (cleanSearch != null) {
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + cleanSearch + "%"),
                    cb.like(cb.lower(root.get("director")), "%" + cleanSearch + "%"),
                    cb.like(cb.lower(root.get("castInfo")), "%" + cleanSearch + "%")
            ));
        }

        List<Movie> movies = movieRepository.findAll(spec);

        return movies.stream()
                .map(MovieResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        return MovieResponse.fromEntity(movie);
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getMovieShowtimes(Long movieId, LocalDate date) {
        if (!movieRepository.existsById(movieId)) {
            throw new ResourceNotFoundException("Movie not found with id: " + movieId);
        }

        List<Showtime> showtimes;
        if (date != null) {
            showtimes = showtimeRepository.findByMovieIdAndShowDate(movieId, date);
        } else {
            showtimes = showtimeRepository.findByMovieId(movieId);
        }

        return showtimes.stream()
                .map(s -> {
                    ShowtimeResponse res = ShowtimeResponse.fromEntity(s);
                    int total = (int) seatRepository.countByShowtimeId(s.getId());
                    res.setTotalSeats(total);
                    return res;
                })
                .collect(Collectors.toList());
    }
}
