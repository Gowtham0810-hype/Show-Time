package com.cineai.repository;

import com.cineai.model.entity.AlertNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertNotificationRepository extends JpaRepository<AlertNotification, Long> {

    List<AlertNotification> findByAlertId(Long alertId);

    @Query("SELECT an FROM AlertNotification an JOIN an.alert a WHERE a.user.id = :userId ORDER BY an.sentAt DESC")
    List<AlertNotification> findByUserId(@Param("userId") Long userId);
}

