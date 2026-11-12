package com.cineai.service;

import com.cineai.exception.SeatAlreadyHeldException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class SeatHoldService {

    private static final Logger log = LoggerFactory.getLogger(SeatHoldService.class);

    private final StringRedisTemplate redisTemplate;
    private final long holdTtlMinutes;

    public SeatHoldService(StringRedisTemplate redisTemplate,
                           @Value("${seat.hold.ttl-minutes:5}") long holdTtlMinutes) {
        this.redisTemplate = redisTemplate;
        this.holdTtlMinutes = holdTtlMinutes;
    }

    public String buildKey(Long showtimeId, Long seatId) {
        return "seat_hold:" + showtimeId + ":" + seatId;
    }

    public boolean holdSeats(Long showtimeId, List<Long> seatIds, Long userId) {
        if (seatIds == null || seatIds.isEmpty()) {
            return true;
        }

        List<Long> heldInThisBatch = new ArrayList<>();

        for (Long seatId : seatIds) {
            String key = buildKey(showtimeId, seatId);
            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent(key, userId.toString(), Duration.ofMinutes(holdTtlMinutes));

            if (Boolean.FALSE.equals(success)) {
                // If it was already held by THIS user, refresh TTL
                String currentHolder = redisTemplate.opsForValue().get(key);
                if (userId.toString().equals(currentHolder)) {
                    redisTemplate.expire(key, Duration.ofMinutes(holdTtlMinutes));
                    heldInThisBatch.add(seatId);
                    continue;
                }

                // Held by someone else - roll back what we acquired in this batch
                releaseHeldSeats(showtimeId, heldInThisBatch, userId);
                log.warn("Seat {} for showtime {} is already held by user {}", seatId, showtimeId, currentHolder);
                throw new SeatAlreadyHeldException("Seat ID " + seatId + " is currently held by another customer");
            }

            heldInThisBatch.add(seatId);
        }

        log.info("User {} successfully held seats {} for showtime {}", userId, seatIds, showtimeId);
        return true;
    }

    public void releaseHeldSeats(Long showtimeId, List<Long> seatIds, Long userId) {
        if (seatIds == null || seatIds.isEmpty()) {
            return;
        }

        for (Long seatId : seatIds) {
            String key = buildKey(showtimeId, seatId);
            String holder = redisTemplate.opsForValue().get(key);
            if (holder != null && holder.equals(userId.toString())) {
                redisTemplate.delete(key);
            }
        }
        log.info("Released holds for user {} on seats {} for showtime {}", userId, seatIds, showtimeId);
    }

    public boolean isHeldByUser(Long showtimeId, Long seatId, Long userId) {
        String key = buildKey(showtimeId, seatId);
        String holder = redisTemplate.opsForValue().get(key);
        return holder != null && holder.equals(userId.toString());
    }

    public boolean isHeld(Long showtimeId, Long seatId) {
        String key = buildKey(showtimeId, seatId);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public String getHolder(Long showtimeId, Long seatId) {
        String key = buildKey(showtimeId, seatId);
        return redisTemplate.opsForValue().get(key);
    }
}
