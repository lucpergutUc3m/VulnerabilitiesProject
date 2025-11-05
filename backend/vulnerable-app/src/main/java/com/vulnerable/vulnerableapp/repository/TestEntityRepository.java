package com.vulnerable.vulnerableapp.repository;

import com.vulnerable.vulnerableapp.entity.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestEntityRepository extends JpaRepository<TestEntity, Long> {
    List<TestEntity> findByOwnerId(Long ownerId);
    
    List<TestEntity> findByOwnerId(Long ownerId);
    
    // Find all public tests or tests owned by the user
    @Query("SELECT t FROM TestEntity t WHERE t.isPublic = true OR t.ownerId = :userId")
    List<TestEntity> findAccessibleByUserId(@Param("userId") Long userId);
    
    // Find only public tests
    List<TestEntity> findByIsPublicTrue();
}
