package com.cineai.service;

import com.cineai.exception.BadRequestException;
import com.cineai.exception.SeatAlreadyBookedException;
import com.cineai.exception.ShowtimeNotFoundException;
import com.cineai.model.dto.response.SeatItemDto;
import com.cineai.model.dto.response.SeatMapResponse;
import com.cineai.model.entity.Seat;
import com.cineai.model.entity.Showtime;
import com.cineai.model.enums.SeatStatus;
import com.cineai.repository.SeatRepository;
import com.cineai.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatService {

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SeatGeneratorService seatGeneratorService;
    private final SeatHoldService seatHoldService;

    public SeatService(ShowtimeRepository showtimeRepository,
                       SeatRepository seatRepository,
                       SeatGeneratorService seatGeneratorService,
                       SeatHoldService seatHoldService) {
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.seatGeneratorService = seatGeneratorService;
        this.seatHoldService = seatHoldService;
    }

    @Transactional
    public SeatMapResponse getSeatMap(Long showtimeId, Long currentUserId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ShowtimeNotFoundException("Showtime not found with id: " + showtimeId));

        List<Seat> seats = seatRepository.findByShowtimeId(showtimeId);
        if (seats.isEmpty() && showtime.getTheater() != null) {
            seats = seatGeneratorService.generateSeatsForShowtime(showtime, showtime.getTheater());
        }

        List<SeatItemDto> seatDtos = new ArrayList<>(seats.size());
        for (Seat seat : seats) {
            SeatStatus effectiveStatus;
            boolean isHeldByYou = false;

            if (seat.getStatus() == SeatStatus.BOOKED) {
                effectiveStatus = SeatStatus.BOOKED;
            } else if (seatHoldService.isHeld(showtimeId, seat.getId())) {
                effectiveStatus = SeatStatus.HELD;
                if (currentUserId != null && seatHoldService.isHeldByUser(showtimeId, seat.getId(), currentUserId)) {
                    isHeldByYou = true;
                }
            } else {
                effectiveStatus = SeatStatus.AVAILABLE;
            }

            seatDtos.add(SeatItemDto.builder()
                    .id(seat.getId())
                    .seatRow(seat.getSeatRow())
                    .seatNumber(seat.getSeatNumber())
                    .label(seat.getSeatRow() + seat.getSeatNumber())
                    .seatCategory(seat.getSeatCategory())
                    .status(effectiveStatus)
                    .heldByCurrentUser(isHeldByYou)
                    .build());
        }

        return SeatMapResponse.builder()
                .showtimeId(showtime.getId())
                .movieId(showtime.getMovie() != null ? showtime.getMovie().getId() : null)
                .movieTitle(showtime.getMovie() != null ? showtime.getMovie().getTitle() : null)
                .theaterId(showtime.getTheater() != null ? showtime.getTheater().getId() : null)
                .theaterName(showtime.getTheater() != null ? showtime.getTheater().getName() : null)
                .screenType(showtime.getTheater() != null && showtime.getTheater().getScreenType() != null ? showtime.getTheater().getScreenType().getValue() : null)
                .showDate(showtime.getShowDate())
                .showTime(showtime.getShowTime())
                .basePrice(showtime.getPrice())
                .totalRows(showtime.getTheater() != null ? showtime.getTheater().getTotalRows() : 0)
                .seatsPerRow(showtime.getTheater() != null ? showtime.getTheater().getSeatsPerRow() : 0)
                .seats(seatDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public boolean holdSeats(Long showtimeId, List<Long> seatIds, Long userId) {
        if (!showtimeRepository.existsById(showtimeId)) {
            throw new ShowtimeNotFoundException("Showtime not found with id: " + showtimeId);
        }

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new BadRequestException("One or more seat IDs are invalid");
        }

        for (Seat seat : seats) {
            if (!seat.getShowtime().getId().equals(showtimeId)) {
                throw new BadRequestException("Seat ID " + seat.getId() + " does not belong to showtime " + showtimeId);
            }
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new SeatAlreadyBookedException("Seat " + seat.getSeatRow() + seat.getSeatNumber() + " is already booked");
            }
        }

        return seatHoldService.holdSeats(showtimeId, seatIds, userId);
    }

    public void releaseSeats(Long showtimeId, List<Long> seatIds, Long userId) {
        seatHoldService.releaseHeldSeats(showtimeId, seatIds, userId);
    }
}
