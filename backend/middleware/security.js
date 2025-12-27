const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// ==================== HELMET CONFIGURATION ====================

/**
 * Configure Helmet with strict security headers
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for mobile compatibility
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },
  
  // Frame Guard - Prevent clickjacking
  frameguard: {
    action: 'deny'
  },
  
  // Hide Powered-By header
  hidePoweredBy: true,
  
  // HSTS - Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open - Prevent IE from executing downloads
  ieNoOpen: true,
  
  // No Sniff - Prevent MIME type sniffing
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  // XSS Filter
  xssFilter: true
});

// ==================== MONGODB INJECTION PREVENTION ====================

/**
 * Sanitize MongoDB queries to prevent NoSQL injection
 */
const mongoSanitizeConfig = mongoSanitize({
  // Remove any keys that start with '$' or contain '.'
  replaceWith: '_',
  
  // Also sanitize data in request body
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Sanitized potentially malicious input: ${key} from ${req.ip}`);
  }
});

// ==================== XSS PROTECTION ====================

/**
 * Clean user input to prevent XSS attacks
 */
const xssProtection = xss();

// ==================== HTTP PARAMETER POLLUTION PROTECTION ====================

/**
 * Protect against HTTP Parameter Pollution attacks
 */
const hppProtection = hpp({
  // Whitelist parameters that are allowed to be arrays
  whitelist: [
    'tags',
    'hazardTypes',
    'severities',
    'spotIds'
  ]
});

// ==================== CUSTOM SECURITY MIDDLEWARE ====================

/**
 * Remove sensitive headers from response
 */
const removeSensitiveHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};

/**
 * Add custom security headers
 */
const addCustomHeaders = (req, res, next) => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Add custom security header
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=()');
  
  next();
};

/**
 * Validate Content-Type for POST/PUT requests
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    // Allow JSON, form-data (for uploads), and urlencoded
    const allowedTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded'
    ];
    
    if (contentType && !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported Media Type',
        allowedTypes: allowedTypes
      });
    }
  }
  
  next();
};

/**
 * Request size limiter
 */
const requestSizeLimiter = (req, res, next) => {
  // Check if request body is too large (for non-multipart requests)
  if (req.get('Content-Length')) {
    const size = parseInt(req.get('Content-Length'));
    const maxSize = 1 * 1024 * 1024; // 1MB for JSON requests
    
    if (!req.is('multipart/form-data') && size > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Request body too large',
        maxSize: '1MB'
      });
    }
  }
  
  next();
};

/**
 * API Key validation for internal endpoints
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.get('X-API-Key');
  const expectedKey = process.env.API_SECRET_KEY;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }
  
  if (apiKey !== expectedKey) {
    console.warn(`⚠️  Invalid API key attempt from ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
};

/**
 * IP Whitelist middleware for admin endpoints
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip;
    
    // Add default trusted IPs
    const trustedIPs = [
      '127.0.0.1',
      '::1',
      ...(process.env.TRUSTED_IPS?.split(',').map(ip => ip.trim()) || []),
      ...allowedIPs
    ];
    
    if (!trustedIPs.includes(clientIP)) {
      console.warn(`⚠️  Unauthorized IP ${clientIP} attempted to access admin endpoint`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    next();
  };
};

/**
 * Log suspicious activity
 */
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\$where/i,
    /\$regex/i,
    /<script>/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /eval\(/i,
    /\.\.\/\.\.\//,  // Path traversal
    /union.*select/i, // SQL injection
  ];
  
  const checkString = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn(`🚨 SUSPICIOUS ACTIVITY DETECTED from ${req.ip}:`);
      console.warn(`   Method: ${req.method} ${req.path}`);
      console.warn(`   Pattern: ${pattern}`);
      console.warn(`   User-Agent: ${req.get('User-Agent')}`);
      
      // In production, you might want to block the request
      // return res.status(400).json({ success: false, message: 'Invalid request' });
      break;
    }
  }
  
  next();
};

/**
 * Sanitize request data
 */
const sanitizeRequest = (req, res, next) => {
  // Recursively sanitize object
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    const sanitized = {};
    for (const key in obj) {
      // Skip dangerous keys
      if (key.startsWith('$') || key.startsWith('__') || key.includes('.')) {
        continue;
      }
      
      sanitized[key] = sanitize(obj[key]);
    }
    return sanitized;
  };
  
  // Sanitize request data
  // req.body is typically writable
  if (req.body) {
    try {
      req.body = sanitize(req.body);
    } catch (e) {
      // fallback: shallow-merge sanitized fields
      const s = sanitize(req.body);
      for (const k of Object.keys(req.body)) delete req.body[k];
      Object.assign(req.body, s);
    }
  }

  // req.query may be a getter-only property in some environments (can't reassign)
  try {
    const originalQuery = req.query || {};
    const sanitizedQuery = sanitize(originalQuery);

    // Only attempt to mutate when req.query looks like a plain object
    if (req.query && typeof req.query === 'object' && !Object.isFrozen(req.query)) {
      for (const k of Object.keys(originalQuery || {})) delete req.query[k];
      Object.assign(req.query, sanitizedQuery);
    } else {
      // Safe fallback: expose sanitized copy for downstream code
      req.customQuery = sanitizedQuery;
      if (Object.keys(sanitizedQuery).length > 0) {
        console.warn('⚠️  req.query is not writable; attached req.customQuery instead');
      }
    }
  } catch (err) {
    // Conservative fallback
    req.customQuery = req.customQuery || {};
    console.warn('⚠️  Error sanitizing req.query; using req.customQuery fallback');
  }

  // req.params usually writable
  if (req.params) {
    try {
      req.params = sanitize(req.params);
    } catch (e) {
      const s = sanitize(req.params);
      for (const k of Object.keys(req.params)) delete req.params[k];
      Object.assign(req.params, s);
    }
  }
  
  next();
};

/**
 * CORS Security Enhancement
 */
const enhancedCors = (allowedOrigins = []) => {
  return (req, res, next) => {
    const origin = req.get('origin');
    
    // List of allowed origins
    const allowed = [
      ...allowedOrigins,
      ...(process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [])
    ];
    
    // In production, be strict
    if (process.env.NODE_ENV === 'production') {
      if (origin && !allowed.includes(origin)) {
        return res.status(403).json({
          success: false,
          message: 'CORS policy violation'
        });
      }
    }
    
    // Set CORS headers
    if (origin && allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  };
};

// ==================== SECURITY AUDIT LOGGING ====================

/**
 * Log security events
 */
const securityAuditLog = (event, details) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    ...details
  };
  
  // In production, send to logging service (e.g., Winston, CloudWatch)
  console.log('🔒 SECURITY AUDIT:', JSON.stringify(logEntry));
  
  // Could also write to file or database
  // fs.appendFileSync('security-audit.log', JSON.stringify(logEntry) + '\n');
};

// ==================== COMBINED SECURITY MIDDLEWARE ====================

/**
 * Apply all security middleware
 */
const applySecurityMiddleware = (app) => {
  // Order matters!
  app.use(helmetConfig);
  app.use(removeSensitiveHeaders);
  app.use(addCustomHeaders);
  app.use(xssProtection);
  app.use(hppProtection);
  app.use(validateContentType);
  app.use(requestSizeLimiter);
  app.use(sanitizeRequest);
  app.use(logSuspiciousActivity);
};

// ==================== EXPORTS ====================

module.exports = {
  // Pre-configured middleware
  helmetConfig,
  mongoSanitizeConfig,
  xssProtection,
  hppProtection,
  
  // Custom middleware
  removeSensitiveHeaders,
  addCustomHeaders,
  validateContentType,
  requestSizeLimiter,
  validateApiKey,
  ipWhitelist,
  logSuspiciousActivity,
  sanitizeRequest,
  enhancedCors,
  
  // Utility functions
  securityAuditLog,
  applySecurityMiddleware
};