package com.vulnerable.vulnerableapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VulnerableAppBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(VulnerableAppBackendApplication.class, args);
	}

}
