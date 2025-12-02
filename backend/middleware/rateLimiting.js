const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const { ipKeyGenerator } = require('express-rate-limit');

// ==================== REDIS SETUP (OPTIONAL) ====================

let redisClient = null;
let redisStore = null;

if (process.env.REDIS_ENABLED === 'true') {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('❌ Redis connection failed after 3 attempts');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000);
      }
    });
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected for rate limiting');
    });
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
      // Fallback to memory store
      redisClient = null;
    });
    
    redisStore = new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    });
  } catch (error) {
    console.error('❌ Redis initialization error:', error);
    redisClient = null;
    redisStore = null;
  }
}

// ==================== RATE LIMIT CONFIGURATIONS ====================

/**
 * Standard rate limiter for general API endpoints
 */
const standardLimiter = rateLimit({
  store: redisStore,
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Key generator - use IP + User-Agent for better tracking
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req)}:${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
  },
  
  // Skip successful requests from counting (optional)
  skip: (req, res) => {
    return res.statusCode < 400;
  },
  
  // Custom handler
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Strict limiter for resource-intensive operations (uploads, ML processing)
 */
const strictLimiter = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_UPLOADS_MAX) || 10,
  message: {
    success: false,
    message: 'Upload limit reached. Please wait before uploading more files.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req)}:${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
  },
  
  handler: (req, res) => {
    console.warn(`⚠️  Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Upload limit reached. You can upload again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Very strict limiter for sensitive operations
 */
const sensitiveOperationsLimiter = rateLimit({
  store: redisStore,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many sensitive operations. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req)}:${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
  }
});

/**
 * Lenient limiter for read-only operations
 */
const readOnlyLimiter = rateLimit({
  store: redisStore,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please wait a moment.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req)}:${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
  },
  
  skip: (req, res) => {
    return res.statusCode < 400;
  }
});

/**
 * Dynamic rate limiter based on endpoint
 */
const createDynamicLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Rate limit exceeded'
  };
  
  return rateLimit({
    store: redisStore,
    ...defaults,
    ...options,
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * IP-based request counter (for monitoring)
 */
const requestCounter = new Map();

const trackRequests = (req, res, next) => {
  const ip = req.ip;
  const current = requestCounter.get(ip) || { count: 0, firstRequest: Date.now() };
  
  current.count++;
  requestCounter.set(ip, current);
  
  // Log suspicious activity (>500 requests from single IP in memory)
  if (current.count > 500) {
    console.warn(`⚠️  Suspicious activity from IP ${ip}: ${current.count} requests`);
  }
  
  // Clean up old entries every 1000 requests
  if (requestCounter.size > 1000) {
    const now = Date.now();
    for (const [ip, data] of requestCounter.entries()) {
      if (now - data.firstRequest > 60 * 60 * 1000) { // Older than 1 hour
        requestCounter.delete(ip);
      }
    }
  }
  
  next();
};

/**
 * Slow down middleware - gradually increase delay for repeated requests
 */
const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window at full speed
  delayMs: (hits) => hits * 100, // Add 100ms delay per request after delayAfter
  maxDelayMs: 5000, // Maximum delay of 5 seconds
  
  // Skip successful requests
  skip: (req, res) => res.statusCode < 400,
  
  keyGenerator: (req) => {
    return `${req.ip}:${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
  }
});

// ==================== TRUSTED IP BYPASS ====================

/**
 * Bypass rate limiting for trusted IPs (internal services)
 */
const bypassTrustedIPs = (req, res, next) => {
  const trustedIPs = (process.env.TRUSTED_IPS || '127.0.0.1,::1')
    .split(',')
    .map(ip => ip.trim());
  
  if (trustedIPs.includes(req.ip)) {
    // Skip rate limiting for trusted IPs
    return next('route');
  }
  
  next();
};

// ==================== MONITORING & STATS ====================

/**
 * Get rate limit statistics
 */
const getRateLimitStats = async () => {
  if (!redisClient) {
    return {
      redis: false,
      tracked: requestCounter.size,
      message: 'Using in-memory tracking'
    };
  }
  
  try {
    const keys = await redisClient.keys('rl:*');
    return {
      redis: true,
      activeKeys: keys.length,
      tracked: requestCounter.size
    };
  } catch (error) {
    return {
      redis: false,
      error: error.message
    };
  }
};

/**
 * Clear rate limit for specific IP (admin function)
 */
const clearRateLimitForIP = async (ip) => {
  if (!redisClient) {
    requestCounter.delete(ip);
    return { success: true, method: 'memory' };
  }
  
  try {
    const keys = await redisClient.keys(`rl:*${ip}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    requestCounter.delete(ip);
    return { success: true, method: 'redis', keysCleared: keys.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Rate limiters
  standardLimiter,
  strictLimiter,
  sensitiveOperationsLimiter,
  readOnlyLimiter,
  speedLimiter,
  
  // Custom limiters
  createDynamicLimiter,
  
  // Middleware
  trackRequests,
  bypassTrustedIPs,
  
  // Admin functions
  getRateLimitStats,
  clearRateLimitForIP,
  
  // Redis client (for manual operations if needed)
  redisClient
};

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
  if (redisClient) {
    redisClient.quit();
  }
});

process.on('SIGINT', () => {
  if (redisClient) {
    redisClient.quit();
  }
});