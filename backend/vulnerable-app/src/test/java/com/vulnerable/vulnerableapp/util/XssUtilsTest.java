package com.vulnerable.vulnerableapp.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for XSS protection utilities
 */
class XssUtilsTest {

    @Test
    void testSanitizeScriptTag() {
        String malicious = "<script>alert('XSS')</script>";
        String sanitized = XssUtils.sanitize(malicious);
        
        assertEquals("&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;", sanitized);
        assertFalse(sanitized.contains("<script>"));
    }

    @Test
    void testSanitizeImgTag() {
        String malicious = "<img src=x onerror=alert(1)>";
        String sanitized = XssUtils.sanitize(malicious);
        
        assertTrue(sanitized.contains("&lt;img"));
        assertFalse(sanitized.contains("<img"));
    }

    @Test
    void testSanitizeWithLimit() {
        String longString = "<script>" + "A".repeat(200) + "</script>";
        String sanitized = XssUtils.sanitizeWithLimit(longString, 50);
        
        assertNotNull(sanitized);
        assertTrue(sanitized.length() <= 50);
        assertTrue(sanitized.startsWith("&lt;script&gt;"));
    }

    @Test
    void testStripHtml() {
        String malicious = "<b>Bold</b> and <script>alert('XSS')</script>";
        String stripped = XssUtils.stripHtml(malicious);
        
        assertFalse(stripped.contains("<b>"));
        assertFalse(stripped.contains("<script>"));
        assertTrue(stripped.contains("Bold"));
    }

    @Test
    void testSanitizeNull() {
        assertNull(XssUtils.sanitize(null));
        assertNull(XssUtils.sanitizeWithLimit(null, 100));
        assertNull(XssUtils.stripHtml(null));
    }

    @Test
    void testSanitizeNormalText() {
        String normal = "This is normal text";
        String sanitized = XssUtils.sanitize(normal);
        
        assertEquals(normal, sanitized);
    }

    @Test
    void testSanitizeSpecialChars() {
        String special = "Test & Company < > \" '";
        String sanitized = XssUtils.sanitize(special);
        
        assertTrue(sanitized.contains("&amp;"));
        assertTrue(sanitized.contains("&lt;"));
        assertTrue(sanitized.contains("&gt;"));
        assertTrue(sanitized.contains("&quot;"));
        assertTrue(sanitized.contains("&#39;"));
    }
}
