package com.vulnerable.vulnerableapp.service;

import com.vulnerable.vulnerableapp.dto.CategoryRequest;
import com.vulnerable.vulnerableapp.dto.CategoryResponse;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.Category;
import com.vulnerable.vulnerableapp.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public List<CategoryResponse> getApprovedCategories() {
        return categoryRepository.findByStatus(1).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<CategoryResponse> getUserCategories(AppUser user) {
        return categoryRepository.findByCreatedBy(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CategoryResponse proposeCategory(AppUser user, CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .emoji(request.getEmoji())
                .status(0) // Pending approval
                .createdBy(user)
                .build();
        
        category = categoryRepository.save(category);
        return convertToResponse(category);
    }
    
    public List<CategoryResponse> getPendingCategories() {
        return categoryRepository.findByStatus(0).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void approveCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setStatus(1); // Approved
        categoryRepository.save(category);
    }
    
    @Transactional
    public void rejectCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setStatus(2); // Rejected
        categoryRepository.save(category);
    }
    
    private CategoryResponse convertToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .emoji(category.getEmoji())
                .status(category.getStatus())
                .createdById(category.getCreatedBy().getId())
                .build();
    }
}
