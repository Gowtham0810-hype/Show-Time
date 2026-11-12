package com.cineai.repository;

import com.cineai.model.entity.MovieAlert;
import com.cineai.model.enums.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieAlertRepository extends JpaRepository<MovieAlert, Long> {

    List<MovieAlert> findByStatus(AlertStatus status);

    List<MovieAlert> findByUserId(Long userId);

    List<MovieAlert> findByUserIdAndStatus(Long userId, AlertStatus status);
}
