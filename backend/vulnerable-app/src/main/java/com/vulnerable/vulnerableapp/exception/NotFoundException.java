package com.vulnerable.vulnerableapp.exception;

public class NotFoundException extends RuntimeException {
    
    public NotFoundException(String message) {
        super(message);
    }
    
    public NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public NotFoundException(String resourceName, Long id) {
        super(String.format("%s with id %d not found", resourceName, id));
    }
    
    public NotFoundException(String resourceName, String identifier) {
        super(String.format("%s with identifier '%s' not found", resourceName, identifier));
    }
}
