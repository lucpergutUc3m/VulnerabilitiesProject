package com.vulnerable.vulnerableapp.mapper;

import com.vulnerable.vulnerableapp.dto.UserResponse;
import com.vulnerable.vulnerableapp.entity.AppUser;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

/**
 * MapStruct mapper for converting between AppUser entity and DTOs
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    
    /**
     * Convert AppUser entity to UserResponse DTO
     */
    UserResponse toUserResponse(AppUser user);
}
