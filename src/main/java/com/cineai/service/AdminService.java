package com.cineai.service;

import com.cineai.exception.DuplicateResourceException;
import com.cineai.exception.ResourceNotFoundException;
import com.cineai.model.dto.request.*;
import com.cineai.model.dto.response.MovieResponse;
import com.cineai.model.dto.response.ShowtimeResponse;
import com.cineai.model.dto.response.TheaterResponse;
import com.cineai.model.entity.Movie;
import com.cineai.model.entity.Showtime;
import com.cineai.model.entity.Theater;
import com.cineai.model.enums.MovieStatus;
import com.cineai.model.enums.ScreenType;
import com.cineai.model.enums.ShowtimeStatus;
import com.cineai.repository.MovieRepository;
import com.cineai.repository.SeatRepository;
import com.cineai.repository.ShowtimeRepository;
import com.cineai.repository.TheaterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SeatGeneratorService seatGeneratorService;
    private final AlertMatcherService alertMatcherService;

    public AdminService(MovieRepository movieRepository,
                        TheaterRepository theaterRepository,
                        ShowtimeRepository showtimeRepository,
                        SeatRepository seatRepository,
                        SeatGeneratorService seatGeneratorService,
                        AlertMatcherService alertMatcherService) {
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.seatGeneratorService = seatGeneratorService;
        this.alertMatcherService = alertMatcherService;
    }

    // ==========================================
    // MOVIES CRUD
    // ==========================================

    @Transactional
    public MovieResponse createMovie(CreateMovieRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .genre(request.getGenre())
                .language(request.getLanguage())
                .durationMins(request.getDurationMins())
                .director(request.getDirector())
                .castInfo(request.getCastInfo())
                .posterUrl(request.getPosterUrl())
                .releaseDate(request.getReleaseDate())
                .status(request.getStatus() != null ? request.getStatus() : MovieStatus.UPCOMING)
                .build();

        Movie saved = movieRepository.save(movie);
        log.info("Created new movie with id: {}", saved.getId());
        return MovieResponse.fromEntity(saved);
    }

    @Transactional
    public MovieResponse updateMovie(Long id, UpdateMovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));

        boolean wasUpcoming = movie.getStatus() == MovieStatus.UPCOMING;

        if (request.getTitle() != null) movie.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) movie.setDescription(request.getDescription());
        if (request.getGenre() != null) movie.setGenre(request.getGenre());
        if (request.getLanguage() != null) movie.setLanguage(request.getLanguage());
        if (request.getDurationMins() != null) movie.setDurationMins(request.getDurationMins());
        if (request.getDirector() != null) movie.setDirector(request.getDirector());
        if (request.getCastInfo() != null) movie.setCastInfo(request.getCastInfo());
        if (request.getPosterUrl() != null) movie.setPosterUrl(request.getPosterUrl());
        if (request.getReleaseDate() != null) movie.setReleaseDate(request.getReleaseDate());
        if (request.getStatus() != null) movie.setStatus(request.getStatus());

        Movie updated = movieRepository.save(movie);
        log.info("Updated movie with id: {} - status: {}", updated.getId(), updated.getStatus());

        // If promoted to NOW_SHOWING, trigger alert matching for any existing showtimes
        if (wasUpcoming && updated.getStatus() == MovieStatus.NOW_SHOWING) {
            log.info("Movie '{}' promoted from UPCOMING to NOW_SHOWING. Checking active user alerts...", updated.getTitle());
            alertMatcherService.matchAlerts();
        }

        return MovieResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(MovieResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        return MovieResponse.fromEntity(movie);
    }

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        movieRepository.delete(movie);
        log.info("Deleted movie with id: {}", id);
    }

    // ==========================================
    // THEATERS CRUD
    // ==========================================

    @Transactional
    public TheaterResponse createTheater(CreateTheaterRequest request) {
        Theater theater = Theater.builder()
                .name(request.getName().trim())
                .location(request.getLocation().trim())
                .city(request.getCity().trim())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .totalRows(request.getTotalRows())
                .seatsPerRow(request.getSeatsPerRow())
                .screenType(request.getScreenType() != null ? request.getScreenType() : ScreenType.STANDARD)
                .build();

        Theater saved = theaterRepository.save(theater);
        log.info("Created theater with id: {}", saved.getId());
        return TheaterResponse.fromEntity(saved);
    }

    @Transactional
    public TheaterResponse updateTheater(Long id, UpdateTheaterRequest request) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + id));

        if (request.getName() != null) theater.setName(request.getName().trim());
        if (request.getLocation() != null) theater.setLocation(request.getLocation().trim());
        if (request.getCity() != null) theater.setCity(request.getCity().trim());
        if (request.getLatitude() != null) theater.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) theater.setLongitude(request.getLongitude());
        if (request.getTotalRows() != null) theater.setTotalRows(request.getTotalRows());
        if (request.getSeatsPerRow() != null) theater.setSeatsPerRow(request.getSeatsPerRow());
        if (request.getScreenType() != null) theater.setScreenType(request.getScreenType());

        Theater updated = theaterRepository.save(theater);
        log.info("Updated theater with id: {}", updated.getId());
        return TheaterResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<TheaterResponse> getAllTheaters() {
        return theaterRepository.findAll().stream()
                .map(TheaterResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TheaterResponse getTheaterById(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + id));
        return TheaterResponse.fromEntity(theater);
    }

    @Transactional
    public void deleteTheater(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + id));
        theaterRepository.delete(theater);
        log.info("Deleted theater with id: {}", id);
    }

    // ==========================================
    // SHOWTIMES CRUD
    // ==========================================

    @Transactional
    public ShowtimeResponse createShowtime(CreateShowtimeRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + request.getMovieId()));

        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + request.getTheaterId()));

        if (showtimeRepository.existsByTheaterIdAndShowDateAndShowTime(
                theater.getId(), request.getShowDate(), request.getShowTime())) {
            throw new DuplicateResourceException(String.format(
                    "Showtime already exists at theater '%s' on %s at %s",
                    theater.getName(), request.getShowDate(), request.getShowTime()
            ));
        }

        // If movie was UPCOMING, automatically promote it to NOW_SHOWING since it now has a published showtime
        if (movie.getStatus() == MovieStatus.UPCOMING) {
            movie.setStatus(MovieStatus.NOW_SHOWING);
            movieRepository.save(movie);
            log.info("Movie '{}' automatically promoted from UPCOMING to NOW_SHOWING upon publishing showtime", movie.getTitle());
        }

        Showtime showtime = Showtime.builder()
                .movie(movie)
                .theater(theater)
                .showDate(request.getShowDate())
                .showTime(request.getShowTime())
                .price(request.getPrice())
                .status(request.getStatus() != null ? request.getStatus() : ShowtimeStatus.ACTIVE)
                .build();

        Showtime saved = showtimeRepository.save(showtime);

        // Auto-generate seats for this showtime
        seatGeneratorService.generateSeatsForShowtime(saved, theater);

        // Check active movie alerts for this newly created showtime
        alertMatcherService.checkAlertsForShowtime(saved);

        log.info("Created showtime with id: {} for movie '{}' at theater '{}'",
                saved.getId(), movie.getTitle(), theater.getName());

        int seatCount = theater.getTotalRows() * theater.getSeatsPerRow();
        ShowtimeResponse response = ShowtimeResponse.fromEntity(saved);
        response.setTotalSeats(seatCount);
        response.setAvailableSeats(seatCount);
        return response;
    }

    @Transactional
    public ShowtimeResponse updateShowtime(Long id, UpdateShowtimeRequest request) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found with id: " + id));

        if (request.getMovieId() != null) {
            Movie movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + request.getMovieId()));
            showtime.setMovie(movie);
        }

        if (request.getTheaterId() != null) {
            Theater theater = theaterRepository.findById(request.getTheaterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + request.getTheaterId()));
            showtime.setTheater(theater);
        }

        if (request.getShowDate() != null) showtime.setShowDate(request.getShowDate());
        if (request.getShowTime() != null) showtime.setShowTime(request.getShowTime());
        if (request.getPrice() != null) showtime.setPrice(request.getPrice());
        if (request.getStatus() != null) showtime.setStatus(request.getStatus());

        Showtime updated = showtimeRepository.save(showtime);
        log.info("Updated showtime with id: {}", updated.getId());

        int totalSeats = (int) seatRepository.countByShowtimeId(updated.getId());
        ShowtimeResponse response = ShowtimeResponse.fromEntity(updated);
        response.setTotalSeats(totalSeats);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeRepository.findAll().stream()
                .map(s -> {
                    ShowtimeResponse res = ShowtimeResponse.fromEntity(s);
                    int totalSeats = (int) seatRepository.countByShowtimeId(s.getId());
                    res.setTotalSeats(totalSeats);
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found with id: " + id));

        ShowtimeResponse response = ShowtimeResponse.fromEntity(showtime);
        int totalSeats = (int) seatRepository.countByShowtimeId(showtime.getId());
        response.setTotalSeats(totalSeats);
        return response;
    }

    @Transactional
    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found with id: " + id));

        seatRepository.deleteByShowtimeId(showtime.getId());
        showtimeRepository.delete(showtime);
        log.info("Deleted showtime with id: {}", id);
    }
}
