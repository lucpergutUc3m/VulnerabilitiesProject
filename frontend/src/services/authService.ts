import type { User, AuthResponse } from '../types/auth';
import { config } from '@env';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';
import logger from '../utils/logger';

const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'user',
  TOKEN_EXPIRY: 'tokenExpiry',
} as const;

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token);
    if (!payload || typeof payload.exp !== 'number') {
      return true;
    }
    
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const bufferTime = 60 * 1000;
    return now > (expiryTime - bufferTime);
  } catch {
    return true;
  }
}

export function getToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  if (!token) {
    return null;
  }
  
  if (isTokenExpired(token)) {
    clearAuth();
    return null;
  }
  
  return token;
}

export function getUser(): User | null {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch {
    clearAuth();
    return null;
  }
}

export function getTokenPayload(): Record<string, unknown> | null {
  const token = getToken();
  if (!token) {
    return null;
  }
  return decodeToken(token);
}

export function saveAuth(authResponse: AuthResponse): void {
  if (!authResponse.token || !authResponse.user) {
    throw new Error('Invalid auth response: missing token or user');
  }
  
  const payload = decodeToken(authResponse.token);
  if (!payload) {
    throw new Error('Invalid token format');
  }
  
  if (!payload.authorities || !Array.isArray(payload.authorities)) {
    logger.warn('Warning: Token missing authorities claim');
  }
  
  if (payload.role !== authResponse.user.role) {
    logger.warn('Warning: Token role does not match user role');
  }
  
  localStorage.setItem(STORAGE_KEYS.TOKEN, authResponse.token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.user));
  
  if (typeof payload.exp === 'number') {
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, (payload.exp * 1000).toString());
  }
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getUser();
  return !!token && !!user;
}

export function isAdminUI(): boolean {
  const user = getUser();
  return user?.role === 1;
}

export function isSuperuser(): boolean {
  const user = getUser();
  return user?.role === 2;
}

export function hasRole(role: number): boolean {
  const user = getUser();
  return user?.role === role;
}

export function hasAuthority(authority: string): boolean {
  const payload = getTokenPayload();
  if (!payload || !payload.authorities) {
    return false;
  }
  return Array.isArray(payload.authorities) && payload.authorities.includes(authority);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (!rateLimiter.canProceed('login', RATE_LIMITS.LOGIN)) {
    const blockedTime = Math.ceil(rateLimiter.getBlockedTimeRemaining('login') / 1000);
    throw new Error(`Too many login attempts. Please try again in ${blockedTime} seconds.`);
  }

  try {
    const url = `${config.api.baseUrl}/auth/login`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const responseBody = await response.text();
        try {
          const errorData = JSON.parse(responseBody);
          errorMessage = errorData.message || errorData.error || errorData.msg || responseBody;
        } catch {
          errorMessage = responseBody || `HTTP ${response.status}`;
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`${response.status} ${response.statusText}: ${errorMessage}`);
    }

    const authResponse: AuthResponse = await response.json();
    
    rateLimiter.reset('login');
    saveAuth(authResponse);
    
    return authResponse;
  } catch (error) {
    clearAuth();
    throw error;
  }
}

export async function register(email: string, name: string, password: string): Promise<AuthResponse> {
  if (!rateLimiter.canProceed('register', RATE_LIMITS.REGISTER)) {
    const blockedTime = Math.ceil(rateLimiter.getBlockedTimeRemaining('register') / 1000);
    throw new Error(`Too many registration attempts. Please try again in ${blockedTime} seconds.`);
  }

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
    
    rateLimiter.reset('register');
    saveAuth(authResponse);
    
    return authResponse;
  } catch (error) {
    clearAuth();
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getToken();
    
    if (token) {
      try {
        const response = await fetch(`${config.api.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          logger.warn(
            'Backend logout failed. Session cleared locally but may still be valid on server.',
            `Status: ${response.status}`
          );
        }
      } catch (error) {
        logger.warn(
          'Could not reach logout endpoint. Session cleared locally but may still be valid on server.',
          error
        );
      }
    }
  } finally {
    clearAuth();
  }
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export function debugAuth(): void {
  if (!import.meta.env.DEV) return;
  
  logger.group('🔐 Auth Debug Info');
  
  const user = getUser();
  const token = getToken();
  const payload = getTokenPayload();
  const isAuth = isAuthenticated();
  const adminCheck = isAdminUI();
  
  logger.log('Authenticated:', isAuth);
  logger.log('Current User:', user);
  logger.log('Is Admin:', adminCheck);
  logger.log('Token (first 50 chars):', token?.substring(0, 50) + '...');
  logger.log('Token Payload:', payload);
  
  if (payload) {
    logger.log('  - Authorities:', payload.authorities);
    logger.log('  - Role:', payload.role);
    logger.log('  - UserId:', payload.userId);
    if (typeof payload.exp === 'number') {
      logger.log('  - Expires:', new Date(payload.exp * 1000).toLocaleString());
    }
  }
  
  logger.groupEnd();
}

export function validateAuthState(): string[] {
  const warnings: string[] = [];
  
  const user = getUser();
  const payload = getTokenPayload();
  
  if (!user || !payload) {
    return warnings;
  }
  
  if (payload.role !== user.role) {
    warnings.push(`Role mismatch: token=${payload.role}, user=${user.role}`);
  }
  
  if (payload.userId !== user.id) {
    warnings.push(`UserId mismatch: token=${payload.userId}, user=${user.id}`);
  }
  
  if (payload.sub !== user.email) {
    warnings.push(`Email mismatch: token=${payload.sub}, user=${user.email}`);
  }
  
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
  isAdminUI,
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
