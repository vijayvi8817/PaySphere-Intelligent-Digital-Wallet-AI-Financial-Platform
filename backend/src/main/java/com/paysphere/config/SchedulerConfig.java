package com.paysphere.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables Spring @Scheduled support for recurring payment processing
 * and other future scheduled tasks.
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
}
