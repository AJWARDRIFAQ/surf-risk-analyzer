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

module.exports = mongoose.model('SurfSpot', surfSpotSchema);