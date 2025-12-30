const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const os = require('os');

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS configuration - allows all origins in development
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/surf-risk-analyzer')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== ROUTES ====================

const surfSpotRoutes = require('./routes/surfSpots');
const hazardReportRoutes = require('./routes/hazardReports');
const incidentRoutes = require('./routes/incidents');

app.use('/api/surf-spots', surfSpotRoutes);
app.use('/api/hazard-reports', hazardReportRoutes);
app.use('/api/incidents', incidentRoutes);

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Surf Risk Analyzer API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Get server network info (helpful for mobile development)
app.get('/api/server-info', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  
  res.json({
    host: addresses[0] || 'localhost',
    port: process.env.PORT || 5000,
    addresses: addresses
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  
  console.log('\n🚀 ================================');
  console.log('   Surf Risk Analyzer API Server');
  console.log('   ================================\n');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  console.log('📱 Access URLs:');
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Local:    http://127.0.0.1:${PORT}`);
  
  // Show all network interfaces
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   Network:  http://${net.address}:${PORT}`);
      }
    }
  }
  
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/server-info`);
  console.log(`   GET  /api/surf-spots`);
  console.log(`   POST /api/hazard-reports`);
  console.log('   ... and more\n');
  console.log('================================\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});