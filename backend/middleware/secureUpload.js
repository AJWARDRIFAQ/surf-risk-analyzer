const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sharp = require('sharp');
const FileType = require('file-type');

// Optional: ClamAV for virus scanning
let NodeClam;
try {
  NodeClam = require('clamscan');
} catch (e) {
  console.log('⚠️  ClamAV not installed - virus scanning disabled');
}

// ==================== CONFIGURATION ====================

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5;

const ALLOWED_IMAGE_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif')
  .split(',')
  .map(t => t.trim());

const ALLOWED_VIDEO_TYPES = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/quicktime,video/x-msvideo')
  .split(',')
  .map(t => t.trim());

const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// File extension to MIME type mapping
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi'
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate secure random filename
 */
const generateSecureFilename = (originalname, mimeType) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const ext = MIME_TO_EXT[mimeType] || path.extname(originalname).slice(1);
  return `hazard-${timestamp}-${randomString}.${ext}`;
};

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`📁 Created upload directory: ${dir}`);
  }
};

/**
 * Verify file type by reading magic numbers (first bytes)
 * More secure than trusting MIME type
 */
const verifyFileType = async (filePath) => {
  try {
    const fileType = await FileType.fromFile(filePath);
    
    if (!fileType) {
      return { valid: false, reason: 'Unable to determine file type' };
    }
    
    if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      return { valid: false, reason: `File type ${fileType.mime} not allowed` };
    }
    
    return { valid: true, mimeType: fileType.mime, ext: fileType.ext };
  } catch (error) {
    return { valid: false, reason: 'Error reading file type' };
  }
};

/**
 * Scan file for viruses using ClamAV
 */
const scanForViruses = async (filePath) => {
  if (!NodeClam || process.env.ENABLE_VIRUS_SCAN !== 'true') {
    return { safe: true, skipped: true };
  }
  
  try {
    const clamscan = await new NodeClam().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'localhost',
        port: process.env.CLAMAV_PORT || 3310,
      }
    });
    
    const { isInfected, viruses } = await clamscan.isInfected(filePath);
    
    if (isInfected) {
      return { safe: false, viruses };
    }
    
    return { safe: true };
  } catch (error) {
    console.error('ClamAV scan error:', error);
    // In production, you might want to reject file if scan fails
    // For now, we'll allow it but log the error
    return { safe: true, error: error.message };
  }
};

/**
 * Process and optimize image
 */
const optimizeImage = async (filePath, outputPath) => {
  try {
    await sharp(filePath)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .png({ compressionLevel: 8 })
      .toFile(outputPath);
    
    // Replace original with optimized
    await fs.unlink(filePath);
    await fs.rename(outputPath, filePath);
    
    return { success: true };
  } catch (error) {
    console.error('Image optimization error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get video metadata and validate
 */
const validateVideo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    
    // Basic size check
    if (stats.size > MAX_FILE_SIZE) {
      return { valid: false, reason: 'Video file too large' };
    }
    
    // Additional validation could be added here (duration, resolution, etc.)
    // Would require ffprobe or similar tool
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Error validating video' };
  }
};

// ==================== MULTER CONFIGURATION ====================

/**
 * Storage configuration with security checks
 */
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/hazards');
    await ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  
  filename: function (req, file, cb) {
    // Generate secure filename
    const secureFilename = generateSecureFilename(file.originalname, file.mimetype);
    cb(null, secureFilename);
  }
});

/**
 * File filter with strict validation
 */
const fileFilter = (req, file, cb) => {
  // Check MIME type (first pass - not fully trusted)
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
  }
  
  // Additional validation will happen after upload
  cb(null, true);
};

/**
 * Multer upload configuration
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fields: 10,
    fieldNameSize: 100,
    fieldSize: 1024 * 1024 // 1MB for text fields
  },
  fileFilter: fileFilter
});

// ==================== POST-UPLOAD VALIDATION MIDDLEWARE ====================

/**
 * Validate uploaded files after Multer processing
 * This middleware should be used AFTER multer middleware
 */
const validateUploadedFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(); // No files uploaded, continue
  }
  
  const validatedFiles = [];
  const errors = [];
  
  for (const file of req.files) {
    try {
      // 1. Verify file type by magic numbers
      const typeCheck = await verifyFileType(file.path);
      
      if (!typeCheck.valid) {
        errors.push({
          file: file.originalname,
          reason: typeCheck.reason
        });
        await fs.unlink(file.path); // Delete invalid file
        continue;
      }
      
      // 2. Virus scan
      const virusScan = await scanForViruses(file.path);
      
      if (!virusScan.safe) {
        errors.push({
          file: file.originalname,
          reason: `Virus detected: ${virusScan.viruses?.join(', ')}`
        });
        await fs.unlink(file.path); // Delete infected file
        continue;
      }
      
      // 3. Type-specific validation and optimization
      if (ALLOWED_IMAGE_TYPES.includes(typeCheck.mimeType)) {
        // Optimize images
        const tempPath = file.path + '.tmp';
        const optimizeResult = await optimizeImage(file.path, tempPath);
        
        if (!optimizeResult.success) {
          console.warn(`Image optimization failed for ${file.originalname}:`, optimizeResult.error);
          // Continue anyway - optimization failure is not critical
        }
        
        validatedFiles.push({
          ...file,
          verifiedMimeType: typeCheck.mimeType,
          type: 'image'
        });
        
      } else if (ALLOWED_VIDEO_TYPES.includes(typeCheck.mimeType)) {
        // Validate video
        const videoCheck = await validateVideo(file.path);
        
        if (!videoCheck.valid) {
          errors.push({
            file: file.originalname,
            reason: videoCheck.reason
          });
          await fs.unlink(file.path);
          continue;
        }
        
        validatedFiles.push({
          ...file,
          verifiedMimeType: typeCheck.mimeType,
          type: 'video'
        });
      }
      
    } catch (error) {
      console.error(`Validation error for ${file.originalname}:`, error);
      errors.push({
        file: file.originalname,
        reason: 'Validation error occurred'
      });
      
      // Try to delete file
      try {
        await fs.unlink(file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }
  }
  
  // If all files failed validation, return error
  if (validatedFiles.length === 0 && req.files.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'All uploaded files failed validation',
      errors: errors
    });
  }
  
  // Replace req.files with validated files
  req.files = validatedFiles;
  
  // Add warnings if some files were rejected
  if (errors.length > 0) {
    req.uploadWarnings = errors;
  }
  
  next();
};

/**
 * Clean up uploaded files on error
 */
const cleanupUploadedFiles = async (req, res, next) => {
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error('Error deleting file during cleanup:', error);
      }
    }
  }
};

// ==================== ERROR HANDLER ====================

/**
 * Handle Multer errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = `Too many files. Maximum is ${MAX_FILES} files`;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
    }
    
    return res.status(400).json({
      success: false,
      message: message,
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};

// ==================== EXPORTS ====================

module.exports = {
  upload,
  validateUploadedFiles,
  cleanupUploadedFiles,
  handleMulterError,
  
  // Utility functions for manual use
  utils: {
    generateSecureFilename,
    verifyFileType,
    scanForViruses,
    optimizeImage,
    validateVideo,
    ensureUploadDir
  },
  
  // Constants
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_MIME_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES
};