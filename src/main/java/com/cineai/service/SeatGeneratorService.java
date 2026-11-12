package com.cineai.service;

import com.cineai.model.entity.Seat;
import com.cineai.model.entity.Showtime;
import com.cineai.model.entity.Theater;
import com.cineai.model.enums.SeatCategory;
import com.cineai.model.enums.SeatStatus;
import com.cineai.repository.SeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(SeatGeneratorService.class);

    private final SeatRepository seatRepository;

    public SeatGeneratorService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    @Transactional
    public List<Seat> generateSeatsForShowtime(Showtime showtime, Theater theater) {
        int totalRows = theater.getTotalRows() != null ? theater.getTotalRows() : 8;
        int seatsPerRow = theater.getSeatsPerRow() != null ? theater.getSeatsPerRow() : 10;

        List<Seat> seats = new ArrayList<>(totalRows * seatsPerRow);

        for (int r = 0; r < totalRows; r++) {
            char rowChar = (char) ('A' + r);
            String rowStr = String.valueOf(rowChar);

            SeatCategory category;
            if (totalRows >= 5 && r >= totalRows - 2) {
                category = SeatCategory.VIP;
            } else if (totalRows >= 4 && r >= totalRows / 2) {
                category = SeatCategory.PREMIUM;
            } else {
                category = SeatCategory.REGULAR;
            }

            for (int num = 1; num <= seatsPerRow; num++) {
                Seat seat = Seat.builder()
                        .showtime(showtime)
                        .seatRow(rowStr)
                        .seatNumber(num)
                        .seatCategory(category)
                        .status(SeatStatus.AVAILABLE)
                        .version(0L)
                        .build();
                seats.add(seat);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        log.info("Generated {} seats for showtime id: {} at theater: {}", savedSeats.size(), showtime.getId(), theater.getName());
        return savedSeats;
    }
}
