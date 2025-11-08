package com.vulnerable.vulnerableapp.exception;

public class ConflictException extends RuntimeException {
    
    public ConflictException(String message) {
        super(message);
    }
    
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public ConflictException(String resourceName, String conflictReason) {
        super(String.format("%s conflict: %s", resourceName, conflictReason));
    }
}
