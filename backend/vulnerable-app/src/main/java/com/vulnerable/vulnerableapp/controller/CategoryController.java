package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.CategoryRequest;
import com.vulnerable.vulnerableapp.dto.CategoryResponse;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getApprovedCategories() {
        return ResponseEntity.ok(categoryService.getApprovedCategories());
    }
    
    @PostMapping("/propose")
    public ResponseEntity<CategoryResponse> proposeCategory(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.proposeCategory(user, request));
    }
    
    @GetMapping("/mine")
    public ResponseEntity<List<CategoryResponse>> getUserCategories(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(categoryService.getUserCategories(user));
    }
}
