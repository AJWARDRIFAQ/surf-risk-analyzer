import { SKILL_RISK_THRESHOLDS } from './constants';

// ==================== SKILL-SPECIFIC RISK HELPERS ====================

/**
 * Get risk level from score based on skill level
 * @param {number} score - Risk score (0-10)
 * @param {string} skillLevel - 'beginner', 'intermediate', 'advanced', or 'overall'
 * @returns {object} Risk level details
 */
export const getRiskLevelForSkill = (score, skillLevel = 'overall') => {
  const thresholds = SKILL_RISK_THRESHOLDS[skillLevel] || SKILL_RISK_THRESHOLDS.overall;
  
  let level, color, bgColor, textColor, flag, emoji;
  
  if (score <= thresholds.low) {
    level = 'Low';
    color = '#10b981';
    bgColor = '#d1fae5';
    textColor = '#065f46';
    flag = 'green';
    emoji = '🟢';
  } else if (score <= thresholds.medium) {
    level = 'Medium';
    color = '#f59e0b';
    bgColor = '#fef3c7';
    textColor = '#92400e';
    flag = 'yellow';
    emoji = '🟡';
  } else {
    level = 'High';
    color = '#ef4444';
    bgColor = '#fee2e2';
    textColor = '#991b1b';
    flag = 'red';
    emoji = '🔴';
  }
  
  return { level, color, bgColor, textColor, flag, emoji, score };
};

/**
 * Get flag color from risk score based on skill level
 * @param {number} score - Risk score (0-10)
 * @param {string} skillLevel - 'beginner', 'intermediate', 'advanced', or 'overall'
 * @returns {string} Flag color
 */
export const getFlagColorForSkill = (score, skillLevel = 'overall') => {
  const thresholds = SKILL_RISK_THRESHOLDS[skillLevel] || SKILL_RISK_THRESHOLDS.overall;
  
  if (score <= thresholds.low) return 'green';
  if (score <= thresholds.medium) return 'yellow';
  return 'red';
};

/**
 * Get risk emoji from score based on skill level
 * @param {number} score - Risk score (0-10)
 * @param {string} skillLevel - 'beginner', 'intermediate', 'advanced', or 'overall'
 * @returns {string} Risk emoji
 */
export const getRiskEmojiForSkill = (score, skillLevel = 'overall') => {
  const flagColor = getFlagColorForSkill(score, skillLevel);
  
  switch(flagColor) {
    case 'green': return '🟢';
    case 'yellow': return '🟡';
    case 'red': return '🔴';
    default: return '⚪';
  }
};

/**
 * Get risk description for skill level
 * @param {number} score - Risk score (0-10)
 * @param {string} skillLevel - 'beginner', 'intermediate', 'advanced', or 'overall'
 * @returns {string} Description
 */
export const getRiskDescriptionForSkill = (score, skillLevel = 'overall') => {
  const riskLevel = getRiskLevelForSkill(score, skillLevel);
  
  const descriptions = {
    beginner: {
      Low: 'Safe for beginners (1-5)',
      Medium: 'Caution for beginners (5-6.5)',
      High: 'Dangerous for beginners (6.5-10)'
    },
    intermediate: {
      Low: 'Safe for intermediates (1-6)',
      Medium: 'Moderate risk (6-7.2)',
      High: 'High risk (7.2-10)'
    },
    advanced: {
      Low: 'Low risk for advanced (1-7)',
      Medium: 'Moderate challenge (7-8)',
      High: 'High risk (8-10)'
    },
    overall: {
      Low: 'Generally safe conditions',
      Medium: 'Caution advised',
      High: 'Dangerous conditions'
    }
  };
  
  return descriptions[skillLevel]?.[riskLevel.level] || descriptions.overall[riskLevel.level];
};

/**
 * Get threshold ranges for a skill level
 * @param {string} skillLevel - 'beginner', 'intermediate', 'advanced', or 'overall'
 * @returns {object} Threshold ranges
 */
export const getThresholdRanges = (skillLevel = 'overall') => {
  const thresholds = SKILL_RISK_THRESHOLDS[skillLevel] || SKILL_RISK_THRESHOLDS.overall;
  
  return {
    low: { min: 1, max: thresholds.low, label: `1-${thresholds.low}` },
    medium: { min: thresholds.low, max: thresholds.medium, label: `${thresholds.low}-${thresholds.medium}` },
    high: { min: thresholds.medium, max: 10, label: `${thresholds.medium}-10` }
  };
};

/**
 * Format risk score with skill-specific context
 * @param {number} score - Risk score (0-10)
 * @param {string} skillLevel - 'beginner', 'intermediate', 'advanced', or 'overall'
 * @returns {string} Formatted string
 */
export const formatRiskScoreForSkill = (score, skillLevel = 'overall') => {
  const riskLevel = getRiskLevelForSkill(score, skillLevel);
  return `${score}/10 ${riskLevel.emoji} ${riskLevel.level}`;
};

/**
 * Get marker color based on flag
 * @param {string} flagColor - 'green', 'yellow', or 'red'
 * @returns {string} Hex color
 */
export const getMarkerColor = (flagColor) => {
  switch(flagColor) {
    case 'green': return '#10b981';
    case 'yellow': return '#f59e0b';
    case 'red': return '#ef4444';
    default: return '#6b7280';
  }
};

/**
 * Format date relative to now
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatRelativeDate = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return target.toLocaleDateString();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Additional helper for backend compatibility
export const calculateSkillRiskLevel = (score, skillLevel) => {
  const risk = getRiskLevelForSkill(score, skillLevel);
  return {
    riskScore: score,
    riskLevel: risk.level,
    flagColor: risk.flag
  };
};

export default {
  getRiskLevelForSkill,
  getFlagColorForSkill,
  getRiskEmojiForSkill,
  getRiskDescriptionForSkill,
  getThresholdRanges,
  formatRiskScoreForSkill,
  calculateSkillRiskLevel,
  getMarkerColor,
  formatRelativeDate,
  isValidEmail,
  formatFileSize,
};