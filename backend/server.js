const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const os = require('os');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:19000', 'http://localhost:19001'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files for uploaded media
app.use('/uploads', express.static('uploads'));

// ==================== DATABASE CONNECTION ====================
const connectDB = require('./config/database');
connectDB();

// ==================== ROUTES ====================
const surfSpotRoutes = require('./routes/surfSpot');
const incidentRoutes = require('./routes/incidents');
const hazardReportRoutes = require('./routes/hazardReports');

app.use('/api/surf-spots', surfSpotRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/hazard-reports', hazardReportRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Surf Risk Analyzer API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Surf Risk Analyzer API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      surfSpots: '/api/surf-spots',
      incidents: '/api/incidents',
      hazardReports: '/api/hazard-reports'
    }
  });
});

// ==================== ERROR HANDLING ====================
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ==================== NETWORK INFO ====================
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
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
const LOCAL_IP = process.env.LOCAL_NETWORK_IP || getLocalIP();

app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SURF RISK ANALYZER API SERVER');
  console.log('='.repeat(60));
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
  console.log('\n💡 Tips:');
  console.log(`   - Update mobile app API_BASE_URL to: http://${LOCAL_IP}:${PORT}/api`);
  console.log(`   - Set LOCAL_NETWORK_IP in .env if auto-detection fails`);
  console.log(`   - Use 'npm run dev' for auto-reload with nodemon`);
  console.log('='.repeat(60) + '\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🔥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});