/**
 * Centralized Authentication Service
 * Manages all token and user data in localStorage
 * Provides a single source of truth for auth state
 */

import type { User, AuthResponse } from '../types/auth';
import { config } from '@env';

const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'user',
  TOKEN_EXPIRY: 'tokenExpiry',
} as const;

/**
 * Decodes JWT payload without verification (for display purposes only)
 * Never trust this for security - always verify on backend
 */
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: expected 3 parts');
      return null;
    }
    
    // Add padding if needed
    const payload = parts[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload || typeof payload.exp !== 'number') {
      return true;
    }
    
    // exp is in seconds, convert to milliseconds
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    
    // Consider expired if less than 1 minute remaining
    const bufferTime = 60 * 1000;
    return now > (expiryTime - bufferTime);
  } catch {
    return true;
  }
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  if (!token) {
    return null;
  }
  
  // Check if expired
  if (isTokenExpired(token)) {
    console.warn('Token is expired, clearing storage');
    clearAuth();
    return null;
  }
  
  return token;
}

/**
 * Get current user from localStorage
 */
export function getUser(): User | null {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    clearAuth();
    return null;
  }
}

/**
 * Get token payload (for debugging/display)
 */
export function getTokenPayload(): Record<string, unknown> | null {
  const token = getToken();
  if (!token) {
    return null;
  }
  return decodeToken(token);
}

/**
 * Save authentication data to localStorage
 */
export function saveAuth(authResponse: AuthResponse): void {
  try {
    // Validate response
    if (!authResponse.token || !authResponse.user) {
      throw new Error('Invalid auth response: missing token or user');
    }
    
    // Verify token format
    const payload = decodeToken(authResponse.token);
    if (!payload) {
      throw new Error('Invalid token format');
    }
    
    // Check required claims
    if (!payload.authorities || !Array.isArray(payload.authorities)) {
      console.warn('Warning: Token missing authorities claim');
    }
    
    if (payload.role !== authResponse.user.role) {
      console.warn('Warning: Token role does not match user role');
      console.warn('  Token role:', payload.role);
      console.warn('  User role:', authResponse.user.role);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, authResponse.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.user));
    
    // Calculate and save expiry time
    if (typeof payload.exp === 'number') {
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, (payload.exp * 1000).toString());
    }
    
    console.log('✅ Auth data saved successfully');
    console.log('User:', authResponse.user);
    console.log('Token authorities:', payload.authorities);
  } catch (error) {
    console.error('Failed to save auth data:', error);
    throw error;
  }
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getUser();
  return !!token && !!user;
}

/**
 * Check if current user is admin (role === 1)
 */
export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 1;
}

/**
 * Check if current user is superuser (role === 2)
 */
export function isSuperuser(): boolean {
  const user = getUser();
  return user?.role === 2;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: number): boolean {
  const user = getUser();
  return user?.role === role;
}

/**
 * Check if token has specific authority
 */
export function hasAuthority(authority: string): boolean {
  const payload = getTokenPayload();
  if (!payload || !payload.authorities) {
    return false;
  }
  return Array.isArray(payload.authorities) && payload.authorities.includes(authority);
}

/**
 * Login - fetch token from backend
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const url = `${config.api.baseUrl}/auth/login`;
    console.log('🔐 Login attempting...');
    console.log('   URL:', url);
    console.log('   Email:', email);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    console.log('📡 Response received');
    console.log('   Status:', response.status);
    console.log('   StatusText:', response.statusText);
    console.log('   Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      let errorMessage = 'Login failed';
      let responseBody = '';
      try {
        responseBody = await response.text();
        console.error('❌ Response body (raw):', responseBody);
        try {
          const errorData = JSON.parse(responseBody);
          errorMessage = errorData.message || errorData.error || errorData.msg || responseBody;
          console.error('❌ Backend error (parsed):', errorData);
        } catch {
          errorMessage = responseBody || `HTTP ${response.status}`;
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`${response.status} ${response.statusText}: ${errorMessage}`);
    }

    const authResponse: AuthResponse = await response.json();
    console.log('✅ Login successful');
    console.log('   User:', authResponse.user);
    console.log('   Token expires in:', authResponse.expiresIn);
    
    // Save to localStorage
    saveAuth(authResponse);
    
    return authResponse;
  } catch (error) {
    console.error('❌ Login error:', error);
    clearAuth();
    throw error;
  }
}

/**
 * Register - create new account
 */
export async function register(email: string, name: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${config.api.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const authResponse: AuthResponse = await response.json();
    
    // Save to localStorage
    saveAuth(authResponse);
    
    return authResponse;
  } catch (error) {
    console.error('Registration failed:', error);
    clearAuth();
    throw error;
  }
}

/**
 * Logout - clear auth and invalidate token on backend
 */
export async function logout(): Promise<void> {
  try {
    const token = getToken();
    
    // Try to invalidate token on backend
    if (token) {
      try {
        await fetch(`${config.api.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {
          // Logout endpoint might not exist, ignore errors
        });
      } catch (error) {
        console.warn('Failed to logout from backend:', error);
      }
    }
  } finally {
    // Always clear local storage
    clearAuth();
  }
}

/**
 * Get authorization header for API calls
 */
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Debug function: Log all auth info to console
 */
export function debugAuth(): void {
  console.group('🔐 Auth Debug Info');
  
  const user = getUser();
  const token = getToken();
  const payload = getTokenPayload();
  const isAuth = isAuthenticated();
  const adminCheck = isAdmin();
  
  console.log('Authenticated:', isAuth);
  console.log('Current User:', user);
  console.log('Is Admin:', adminCheck);
  console.log('Token (first 50 chars):', token?.substring(0, 50) + '...');
  console.log('Token Payload:', payload);
  
  if (payload) {
    console.log('  - Authorities:', payload.authorities);
    console.log('  - Role:', payload.role);
    console.log('  - UserId:', payload.userId);
    if (typeof payload.exp === 'number') {
      console.log('  - Expires:', new Date(payload.exp * 1000).toLocaleString());
    }
  }
  
  console.groupEnd();
}

/**
 * Validate auth state consistency
 * Returns warnings if there are inconsistencies
 */
export function validateAuthState(): string[] {
  const warnings: string[] = [];
  
  const user = getUser();
  const payload = getTokenPayload();
  
  if (!user || !payload) {
    return warnings;
  }
  
  // Check role consistency
  if (payload.role !== user.role) {
    warnings.push(`Role mismatch: token=${payload.role}, user=${user.role}`);
  }
  
  // Check userId consistency
  if (payload.userId !== user.id) {
    warnings.push(`UserId mismatch: token=${payload.userId}, user=${user.id}`);
  }
  
  // Check email consistency
  if (payload.sub !== user.email) {
    warnings.push(`Email mismatch: token=${payload.sub}, user=${user.email}`);
  }
  
  // Check authorities format
  if (!payload.authorities || !Array.isArray(payload.authorities)) {
    warnings.push('Token missing or invalid authorities claim');
  }
  
  return warnings;
}

export default {
  getToken,
  getUser,
  getTokenPayload,
  saveAuth,
  clearAuth,
  isAuthenticated,
  isAdmin,
  isSuperuser,
  hasRole,
  hasAuthority,
  login,
  register,
  logout,
  getAuthHeader,
  debugAuth,
  validateAuthState,
};
