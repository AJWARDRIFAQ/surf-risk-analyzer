const mongoose = require('mongoose');

const surfSpotSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  // Overall risk (for general display)
  riskScore: { type: Number, default: 0, min: 0, max: 10 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  flagColor: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' },
  
  // Skill-specific risks
  skillLevelRisks: {
    beginner: {
      incidents: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0, min: 0, max: 10 },
      riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      flagColor: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' }
    },
    intermediate: {
      incidents: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0, min: 0, max: 10 },
      riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      flagColor: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' }
    },
    advanced: {
      incidents: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0, min: 0, max: 10 },
      riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      flagColor: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' }
    }
  },
  
  lastUpdated: { type: Date, default: Date.now },
  totalIncidents: { type: Number, default: 0 },
  recentHazards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HazardReport' }],
  historicalData: {
    seasonalPatterns: mongoose.Schema.Types.Mixed,
    commonHazards: [String],
    peakRiskMonths: [Number]
  }
});

// Overall risk calculation (general users)
surfSpotSchema.methods.calculateRiskScore = function() {
  if (this.riskScore <= 3.3) {
    this.riskLevel = 'Low';
    this.flagColor = 'green';
  } else if (this.riskScore <= 6.6) {
    this.riskLevel = 'Medium';
    this.flagColor = 'yellow';
  } else {
    this.riskLevel = 'High';
    this.flagColor = 'red';
  }
};

// Skill-specific risk calculation with custom thresholds
surfSpotSchema.methods.calculateSkillRiskScore = function(skillLevel, riskScore) {
  const thresholds = {
    beginner: {
      low: 5.0,      // 1-5 = Green
      medium: 6.5    // 5-6.5 = Yellow, 6.5-10 = Red
    },
    intermediate: {
      low: 6.0,      // 1-6 = Green
      medium: 7.2    // 6-7.2 = Yellow, 7.2-10 = Red
    },
    advanced: {
      low: 7.0,      // 1-7 = Green
      medium: 8.0    // 7-8 = Yellow, 8-10 = Red
    }
  };

  const threshold = thresholds[skillLevel];
  
  if (!threshold) {
    // Fallback to default thresholds
    return this.calculateRiskScore();
  }

  let riskLevel, flagColor;

  if (riskScore <= threshold.low) {
    riskLevel = 'Low';
    flagColor = 'green';
  } else if (riskScore <= threshold.medium) {
    riskLevel = 'Medium';
    flagColor = 'yellow';
  } else {
    riskLevel = 'High';
    flagColor = 'red';
  }

  // Update the skill-specific risk data
  if (this.skillLevelRisks && this.skillLevelRisks[skillLevel]) {
    this.skillLevelRisks[skillLevel].riskScore = riskScore;
    this.skillLevelRisks[skillLevel].riskLevel = riskLevel;
    this.skillLevelRisks[skillLevel].flagColor = flagColor;
  }

  return { riskLevel, flagColor };
};

module.exports = mongoose.model('SurfSpot', surfSpotSchema);