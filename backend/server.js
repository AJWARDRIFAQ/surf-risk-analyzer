const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');
const path = require('path');

// Load environment variables
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['API_SECRET_KEY', 'MONGODB_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize express app
const app = express();

// ==================== IMPORT SECURITY MIDDLEWARE ====================
const {
  applySecurityMiddleware,
  enhancedCors,
  validateApiKey,
  ipWhitelist
} = require('./middleware/security');

const {
  standardLimiter,
  strictLimiter,
  readOnlyLimiter,
  trackRequests
} = require('./middleware/rateLimiting');

const { sanitizeQuery } = require('./middleware/validation');

// ==================== SECURITY MIDDLEWARE ====================

// Apply comprehensive security middleware
applySecurityMiddleware(app);

// CORS Configuration with enhanced security
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:19000', 'http://localhost:19001'];

app.use(enhancedCors(allowedOrigins));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Track all requests for monitoring
app.use(trackRequests);

// Sanitize query parameters
app.use(sanitizeQuery);

// Static files with security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Prevent execution of uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    
    // Only serve media files
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi'];
    
    if (!allowedExtensions.includes(ext)) {
      res.status(403).end();
    }
  }
}));

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful');
    
    // Monitor connection
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Don't exit immediately, retry after delay
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// ==================== ROUTES WITH RATE LIMITING ====================

// Public read-only routes (lenient rate limiting)
const surfSpotRoutes = require('./routes/surfSpot');
const incidentRoutes = require('./routes/incidents');

app.use('/api/surf-spots', readOnlyLimiter, surfSpotRoutes);
app.use('/api/incidents', readOnlyLimiter, incidentRoutes);

// Hazard report routes (strict rate limiting for submissions)
const hazardReportRoutes = require('./routes/hazardReports');
app.use('/api/hazard-reports', standardLimiter, hazardReportRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK',
    service: 'Surf Risk Analyzer API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// Protected health check with detailed info (API key required)
app.get('/api/health/detailed', validateApiKey, (req, res) => {
  res.json({
    status: 'OK',
    service: 'Surf Risk Analyzer API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
        free: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB'
      },
      uptime: os.uptime()
    },
    process: {
      uptime: process.uptime(),
      pid: process.pid,
      memory: process.memoryUsage(),
      versions: process.versions
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Surf Risk Analyzer API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api/docs',
    endpoints: {
      health: 'GET /api/health',
      surfSpots: 'GET /api/surf-spots',
      incidents: 'GET /api/incidents',
      hazardReports: 'POST /api/hazard-reports'
    },
    security: {
      rateLimit: 'Enabled',
      cors: 'Enabled',
      helmet: 'Enabled',
      xss: 'Enabled',
      mongoSanitize: 'Enabled'
    }
  });
});

// ==================== ADMIN ENDPOINTS (IP RESTRICTED) ====================

// Clear rate limit for specific IP (admin only)
const { clearRateLimitForIP, getRateLimitStats } = require('./middleware/rateLimiting');

app.post('/api/admin/clear-rate-limit', 
  ipWhitelist(), 
  validateApiKey, 
  async (req, res) => {
    try {
      const { ip } = req.body;
      
      if (!ip) {
        return res.status(400).json({
          success: false,
          message: 'IP address required'
        });
      }
      
      const result = await clearRateLimitForIP(ip);
      
      res.json({
        success: result.success,
        message: `Rate limit cleared for ${ip}`,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error clearing rate limit',
        error: error.message
      });
    }
  }
);

// Get rate limit statistics (admin only)
app.get('/api/admin/rate-limit-stats', 
  ipWhitelist(), 
  validateApiKey, 
  async (req, res) => {
    try {
      const stats = await getRateLimitStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching stats',
        error: error.message
      });
    }
  }
);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ==================== NETWORK INFO ====================
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const LOCAL_IP = process.env.LOCAL_NETWORK_IP === 'auto' 
  ? getLocalIP() 
  : (process.env.LOCAL_NETWORK_IP || getLocalIP());

const server = app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🛡️  SURF RISK ANALYZER API SERVER - SECURED');
  console.log('='.repeat(70));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log('\n📡 Access URLs:');
  console.log(`   Local:            http://localhost:${PORT}`);
  console.log(`   Network:          http://${LOCAL_IP}:${PORT}`);
  console.log(`   Mobile/Emulator:  http://${LOCAL_IP}:${PORT}`);
  console.log('\n🔗 API Endpoints:');
  console.log(`   Health Check:     http://${LOCAL_IP}:${PORT}/api/health`);
  console.log(`   Surf Spots:       http://${LOCAL_IP}:${PORT}/api/surf-spots`);
  console.log(`   Hazard Reports:   http://${LOCAL_IP}:${PORT}/api/hazard-reports`);
  console.log('\n🔒 Security Features:');
  console.log(`   ✅ Helmet - Security headers`);
  console.log(`   ✅ CORS - Origin validation`);
  console.log(`   ✅ Rate Limiting - ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} req/15min`);
  console.log(`   ✅ XSS Protection - Input sanitization`);
  console.log(`   ✅ MongoDB Sanitization - NoSQL injection prevention`);
  console.log(`   ✅ HPP Protection - Parameter pollution prevention`);
  console.log(`   ✅ File Upload Validation - Type & size checking`);
  console.log(`   ${process.env.ENABLE_VIRUS_SCAN === 'true' ? '✅' : '⚠️ '} Virus Scanning - ${process.env.ENABLE_VIRUS_SCAN === 'true' ? 'Enabled' : 'Disabled (optional)'}`);
  console.log('\n💡 Tips:');
  console.log(`   - Update mobile app API_BASE_URL to: http://${LOCAL_IP}:${PORT}/api`);
  console.log(`   - Set API_SECRET_KEY in .env for admin endpoints`);
  console.log(`   - Enable Redis for distributed rate limiting (optional)`);
  console.log(`   - Use 'npm run dev' for auto-reload with nodemon`);
  console.log('='.repeat(70) + '\n');
});

// ==================== GRACEFUL SHUTDOWN ====================

const gracefulShutdown = async (signal) => {
  console.log(`\n📡 ${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB:', error);
    }
    
    console.log('👋 Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after 30 seconds');
    process.exit(1);
  }, 30000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🔥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

module.exports = app; // For testing