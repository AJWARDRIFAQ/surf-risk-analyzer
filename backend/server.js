const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static files for uploaded media
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
const connectDB = require('./config/database');
connectDB();

// Import routes
//const authRoutes = require('./routes/auth');
const surfSpotRoutes = require('./routes/surfSpot');
const incidentRoutes = require('./routes/incidents');
const hazardReportRoutes = require('./routes/hazardReports');

// Use routes
//app.use('/api/auth', authRoutes);
app.use('/api/surf-spots', surfSpotRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/hazard-reports', hazardReportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Surf Risk Analyzer API is running' });
});

// Import and use centralized error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  // Find your computer's local IP (e.g., 192.168.1.5) and use it here
  console.log(`📱 Phone access: http://10.208.128.168:${PORT}`);
});