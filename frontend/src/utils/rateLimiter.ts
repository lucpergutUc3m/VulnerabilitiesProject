interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();

  canProceed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return true;
    }

    if (record.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    if (now - record.firstAttempt > config.windowMs) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return true;
    }

    record.count++;

    if (record.count > config.maxAttempts) {
      if (config.blockDurationMs) {
        record.blockedUntil = now + config.blockDurationMs;
      }
      return false;
    }

    return true;
  }

  getBlockedTimeRemaining(key: string): number {
    const record = this.attempts.get(key);
    if (!record?.blockedUntil) return 0;
    
    const remaining = record.blockedUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now - record.firstAttempt > maxAge) {
        this.attempts.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 60000,
    blockDurationMs: 300000,
  },
  REGISTER: {
    maxAttempts: 3,
    windowMs: 300000,
    blockDurationMs: 600000,
  },
  CREATE_TEST: {
    maxAttempts: 10,
    windowMs: 60000,
  },
  DELETE_TEST: {
    maxAttempts: 20,
    windowMs: 60000,
  },
  UPDATE_PROFILE: {
    maxAttempts: 5,
    windowMs: 60000,
  },
} as const;

if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 3600000);
}

export default rateLimiter;
