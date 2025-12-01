// ... (keep existing helpers)

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
      Low: 'Ideal conditions for beginners (1-5)',
      Medium: 'Caution advised for beginners (5-6.5)',
      High: 'Dangerous for beginners (6.5-10)'
    },
    intermediate: {
      Low: 'Safe for intermediate surfers (1-6)',
      Medium: 'Moderate risk for intermediates (6-7.2)',
      High: 'High risk for intermediates (7.2-10)'
    },
    advanced: {
      Low: 'Low risk for advanced surfers (1-7)',
      Medium: 'Some caution for advanced (7-8)',
      High: 'Challenging even for advanced (8-10)'
    },
    overall: {
      Low: 'Generally safe conditions',
      Medium: 'Caution advised - check conditions',
      High: 'Dangerous conditions - avoid if possible'
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

// ... (keep rest of existing helpers)