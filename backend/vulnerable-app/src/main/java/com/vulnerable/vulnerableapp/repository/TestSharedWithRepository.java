package com.vulnerable.vulnerableapp.repository;

import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.entity.TestSharedWith;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestSharedWithRepository extends JpaRepository<TestSharedWith, Long> {
    Optional<TestSharedWith> findByTestAndSharedWithUser(TestEntity test, AppUser sharedWithUser);
    void deleteByTestAndSharedWithUser(TestEntity test, AppUser sharedWithUser);
    boolean existsByTestAndSharedWithUser(TestEntity test, AppUser sharedWithUser);
}
