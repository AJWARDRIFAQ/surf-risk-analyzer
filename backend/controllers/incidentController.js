const Incident = require('../models/Incident');

exports.getIncidentsBySpot = async (req, res) => {
  try {
    const { spotName } = req.params;
    
    const incidents = await Incident.find({ 
      site: new RegExp(spotName, 'i') 
    }).sort({ date: -1 });

    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching incidents', 
      error: error.message 
    });
  }
};

exports.getAllIncidents = async (req, res) => {
  try {
  const q = req.customQuery || req.query || {};
  const page = parseInt(q.page) || 1;
  const limit = parseInt(q.limit) || 50;
    const skip = (page - 1) * limit;

    const incidents = await Incident.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Incident.countDocuments();

    res.json({
      success: true,
      count: incidents.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: incidents
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching incidents', 
      error: error.message 
    });
  }
};