package com.cineai.model.entity;

import com.cineai.model.enums.NotificationChannel;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alert_notifications")
public class AlertNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alert_id", nullable = false)
    private MovieAlert alert;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel = NotificationChannel.EMAIL;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    public AlertNotification() {}

    public AlertNotification(Long id, MovieAlert alert, Showtime showtime, NotificationChannel channel, LocalDateTime sentAt) {
        this.id = id;
        this.alert = alert;
        this.showtime = showtime;
        this.channel = channel != null ? channel : NotificationChannel.EMAIL;
        this.sentAt = sentAt;
    }

    public static AlertNotificationBuilder builder() {
        return new AlertNotificationBuilder();
    }

    public static class AlertNotificationBuilder {
        private Long id;
        private MovieAlert alert;
        private Showtime showtime;
        private NotificationChannel channel = NotificationChannel.EMAIL;
        private LocalDateTime sentAt;

        public AlertNotificationBuilder id(Long id) { this.id = id; return this; }
        public AlertNotificationBuilder alert(MovieAlert alert) { this.alert = alert; return this; }
        public AlertNotificationBuilder showtime(Showtime showtime) { this.showtime = showtime; return this; }
        public AlertNotificationBuilder channel(NotificationChannel channel) { this.channel = channel; return this; }
        public AlertNotificationBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }

        public AlertNotification build() {
            return new AlertNotification(id, alert, showtime, channel, sentAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public MovieAlert getAlert() { return alert; }
    public void setAlert(MovieAlert alert) { this.alert = alert; }
    public Showtime getShowtime() { return showtime; }
    public void setShowtime(Showtime showtime) { this.showtime = showtime; }
    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
