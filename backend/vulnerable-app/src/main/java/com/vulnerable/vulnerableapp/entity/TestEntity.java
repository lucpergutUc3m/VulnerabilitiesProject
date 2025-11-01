package com.vulnerable.vulnerableapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_entity")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "questions_json", columnDefinition = "TEXT")
    private String questionsJson;
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;
    
    @Column
    private String category;
    
    @Column
    private String emoji;
}
