package com.vulnerable.vulnerableapp.repository;

import com.vulnerable.vulnerableapp.entity.TestRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestRatingRepository extends JpaRepository<TestRating, Long> {
    Optional<TestRating> findByUserIdAndTestId(Long userId, Long testId);
    
    List<TestRating> findByTestId(Long testId);
    
    boolean existsByUserIdAndTestId(Long userId, Long testId);
    
    long countByTestId(Long testId);
    
    void deleteByUserIdAndTestId(Long userId, Long testId);
}
