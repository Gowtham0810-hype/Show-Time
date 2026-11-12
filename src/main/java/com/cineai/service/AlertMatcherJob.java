package com.cineai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AlertMatcherJob {

    private static final Logger log = LoggerFactory.getLogger(AlertMatcherJob.class);

    private final AlertMatcherService alertMatcherService;

    public AlertMatcherJob(AlertMatcherService alertMatcherService) {
        this.alertMatcherService = alertMatcherService;
    }

    @Scheduled(fixedRateString = "${alert.matcher.interval-ms:900000}", initialDelayString = "${alert.matcher.initial-delay-ms:60000}")
    public void matchAlertsToNewShowtimes() {
        log.debug("Starting scheduled alert matcher execution");
        try {
            int triggered = alertMatcherService.matchAlerts();
            if (triggered > 0) {
                log.info("Scheduled alert matcher successfully triggered {} alerts", triggered);
            }
        } catch (Exception e) {
            log.error("Error during scheduled alert matcher execution: {}", e.getMessage(), e);
        }
    }
}
