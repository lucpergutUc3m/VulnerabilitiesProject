package com.vulnerable.vulnerableapp.repository;

import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestEntityRepository extends JpaRepository<TestEntity, Long> {
    List<TestEntity> findByOwner(AppUser owner);
    
    @Query("SELECT t FROM TestEntity t WHERE t.owner = :user OR t.id IN " +
           "(SELECT ts.test.id FROM TestSharedWith ts WHERE ts.sharedWithUser = :user)")
    List<TestEntity> findAccessibleByUser(@Param("user") AppUser user);
    
    @Query("SELECT t FROM TestEntity t JOIN TestSharedWith ts ON t.id = ts.test.id " +
           "WHERE ts.sharedWithUser = :user")
    List<TestEntity> findSharedWithUser(@Param("user") AppUser user);
    
    @Query("SELECT t FROM TestEntity t WHERE " +
           "(t.owner = :user OR t.id IN (SELECT ts.test.id FROM TestSharedWith ts WHERE ts.sharedWithUser = :user)) " +
           "AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<TestEntity> searchAccessibleTests(@Param("user") AppUser user, @Param("keyword") String keyword);
}
