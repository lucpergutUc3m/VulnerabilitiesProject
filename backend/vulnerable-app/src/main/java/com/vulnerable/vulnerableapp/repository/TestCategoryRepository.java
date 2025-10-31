package com.vulnerable.vulnerableapp.repository;

import com.vulnerable.vulnerableapp.entity.Category;
import com.vulnerable.vulnerableapp.entity.TestCategory;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestCategoryRepository extends JpaRepository<TestCategory, Long> {
    List<TestCategory> findByTest(TestEntity test);
    Optional<TestCategory> findByTestAndCategory(TestEntity test, Category category);
    void deleteByTestAndCategory(TestEntity test, Category category);
}
