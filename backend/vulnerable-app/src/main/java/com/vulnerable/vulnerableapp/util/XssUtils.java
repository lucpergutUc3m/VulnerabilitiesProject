package com.vulnerable.vulnerableapp.util;

import org.springframework.web.util.HtmlUtils;

/**
 * Utility class for XSS protection
 */
public final class XssUtils {
    
    private XssUtils() {
        throw new UnsupportedOperationException("Utility class");
    }
    
    /**
     * Sanitize input by escaping HTML special characters
     * Converts: < > & " ' to their HTML entity equivalents
     */
    public static String sanitize(String input) {
        if (input == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(input);
    }
    
    /**
     * Sanitize input and limit length to prevent oversized attacks
     */
    public static String sanitizeWithLimit(String input, int maxLength) {
        if (input == null) {
            return null;
        }
        String sanitized = HtmlUtils.htmlEscape(input);
        if (sanitized.length() > maxLength) {
            return sanitized.substring(0, maxLength);
        }
        return sanitized;
    }
    
    /**
     * Remove all HTML tags from input (more aggressive)
     */
    public static String stripHtml(String input) {
        if (input == null) {
            return null;
        }
        // Remove all HTML tags
        String noHtml = input.replaceAll("<[^>]*>", "");
        // Also escape remaining special chars
        return HtmlUtils.htmlEscape(noHtml);
    }
}
