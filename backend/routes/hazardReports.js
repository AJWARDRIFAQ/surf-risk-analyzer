const express = require('express');
const router = express.Router();
const HazardReport = require('../models/HazardReport');
const SurfSpot = require('../models/SurfSpot');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Import security middleware
const { 
  upload, 
  validateUploadedFiles, 
  cleanupUploadedFiles,
  handleMulterError 
} = require('../middleware/secureUpload');

const { 
  validateHazardReport, 
  validateSurfSpotId,
  validateReporterName 
} = require('../middleware/validation');

const { strictLimiter } = require('../middleware/rateLimiting');

// ==================== SUBMIT HAZARD REPORT ====================

/**
 * POST /api/hazard-reports
 * Submit new hazard report with media
 */
router.post('/',
  strictLimiter, // Apply strict rate limiting (10 requests per 15 min)
  upload.array('media', 5), // Accept up to 5 files
  handleMulterError, // Handle Multer errors
  validateUploadedFiles, // Validate file types, scan for viruses
  validateHazardReport, // Validate request body
  async (req, res) => {
    try {
      const { surfSpotId, hazardType, description, severity, reporterName } = req.body;
      
      // Verify surf spot exists
      const surfSpot = await SurfSpot.findById(surfSpotId);
      if (!surfSpot) {
        // Clean up uploaded files
        if (req.files) {
          await cleanupUploadedFiles(req);
        }
        
        return res.status(404).json({ 
          success: false, 
          message: 'Surf spot not found' 
        });
      }

      // Process uploaded media
      const mediaFiles = req.files ? req.files.map(file => ({
        type: file.verifiedMimeType.startsWith('image') ? 'image' : 'video',
        url: `/uploads/hazards/${file.filename}`,
        filename: file.filename,
        size: file.size,
        mimeType: file.verifiedMimeType
      })) : [];

      // Sanitize and validate reporter name
      const sanitizedReporterName = validateReporterName(reporterName);

      // Create hazard report
      const hazardReport = new HazardReport({
        surfSpot: surfSpotId,
        reporterName: sanitizedReporterName,
        hazardType,
        description: description.trim(),
        severity: severity.toLowerCase(),
        media: mediaFiles,
        reportDate: new Date()
      });

      // If media exists, send to ML model for analysis (non-blocking)
      if (mediaFiles.length > 0) {
        // Run ML analysis asynchronously
        processMLAnalysis(mediaFiles, hazardType, hazardReport._id)
          .catch(error => {
            console.error('ML analysis error (non-blocking):', error.message);
          });
      }

      await hazardReport.save();

      // Add to surf spot's recent hazards
      surfSpot.recentHazards.push(hazardReport._id);
      if (surfSpot.recentHazards.length > 10) {
        surfSpot.recentHazards.shift(); // Keep only last 10
      }
      await surfSpot.save();

      // Trigger risk score recalculation (non-blocking)
      updateRiskScore(surfSpotId)
        .catch(error => {
          console.error('Risk score update error (non-blocking):', error.message);
        });

      // Prepare response
      const response = {
        success: true,
        message: 'Hazard report submitted successfully',
        data: {
          id: hazardReport._id,
          surfSpot: {
            id: surfSpot._id,
            name: surfSpot.name
          },
          hazardType: hazardReport.hazardType,
          severity: hazardReport.severity,
          reportDate: hazardReport.reportDate,
          mediaCount: mediaFiles.length,
          status: 'pending'
        }
      };

      // Add warnings if some files were rejected
      if (req.uploadWarnings && req.uploadWarnings.length > 0) {
        response.warnings = {
          message: 'Some files were rejected during validation',
          rejectedFiles: req.uploadWarnings
        };
      }

      res.status(201).json(response);
      
    } catch (error) {
      console.error('Error submitting hazard report:', error);
      
      // Clean up uploaded files on error
      if (req.files) {
        await cleanupUploadedFiles(req);
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Error submitting hazard report', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// ==================== GET HAZARD REPORTS BY SPOT ====================

/**
 * GET /api/hazard-reports/spot/:spotId
 * Get hazard reports for a specific surf spot
 */
router.get('/spot/:spotId',
  validateSurfSpotId,
  async (req, res) => {
    try {
      const { spotId } = req.params;
      
      // Get reports from last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const reports = await HazardReport.find({
        surfSpot: spotId,
        reportDate: { $gte: yesterday },
        status: { $ne: 'rejected' }
      })
      .select('-analysisResult') // Don't expose ML analysis details
      .sort({ reportDate: -1 })
      .limit(50); // Limit to 50 most recent

      res.json({
        success: true,
        count: reports.length,
        timeframe: '24 hours',
        data: reports
      });
      
    } catch (error) {
      console.error('Error fetching hazard reports:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching hazard reports', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Process ML analysis asynchronously
 */
async function processMLAnalysis(mediaFiles, hazardType, reportId) {
  try {
    const formData = new FormData();
    
    // Only send images to ML model
    const images = mediaFiles.filter(m => m.type === 'image');
    
    if (images.length === 0) {
      return; // No images to analyze
    }
    
    images.forEach(media => {
      const filePath = `uploads/hazards/${media.filename}`;
      formData.append('images', fs.createReadStream(filePath));
    });
    
    formData.append('hazard_type', hazardType);

    const mlResponse = await axios.post(
      `${process.env.ML_API_URL}/analyze-hazard`,
      formData,
      { 
        headers: formData.getHeaders(),
        timeout: 30000 // 30 second timeout
      }
    );

    // Update hazard report with ML analysis
    if (mlResponse.data && mlResponse.data.success) {
      await HazardReport.findByIdAndUpdate(reportId, {
        analysisResult: {
          detectedHazards: mlResponse.data.detectedHazards,
          confidenceScore: mlResponse.data.confidenceScore,
          aiSuggestions: mlResponse.data.aiSuggestions
        }
      });
      
      console.log(`✅ ML analysis completed for report ${reportId}`);
    }
    
  } catch (error) {
    console.error('ML analysis error:', error.message);
    // Don't throw - this is non-blocking
  }
}

/**
 * Update risk score asynchronously
 */
async function updateRiskScore(surfSpotId) {
  try {
    await axios.post(
      `${process.env.ML_API_URL}/update-risk-score`,
      { surf_spot_id: surfSpotId },
      { timeout: 10000 }
    );
    
    console.log(`✅ Risk score update triggered for spot ${surfSpotId}`);
    
  } catch (error) {
    console.error('Risk score update error:', error.message);
    // Don't throw - this is non-blocking
  }
}

module.exports = router;