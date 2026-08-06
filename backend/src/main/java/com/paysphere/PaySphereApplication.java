package com.paysphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PaySphereApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaySphereApplication.class, args);
    }
}
