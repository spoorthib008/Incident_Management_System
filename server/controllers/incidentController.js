// server/controllers/incidentController.js
const Incident = require('../models/Incident');

// CREATE: POST /api/incidents
const createIncident = async (req, res) => {
  try {
    const { type, incidentStartDate, incidentEndDate, description, remarks } = req.body;

    if (!type || !incidentStartDate || !description) {
      return res
        .status(400)
        .json({ message: 'type, incidentStartDate, and description are required' });
    }

    const incident = await Incident.create({
      type,
      incidentStartDate,
      incidentEndDate,
      description,
      remarks
    });

    res.status(201).json(incident);
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// READ ALL: GET /api/incidents?status=open|closed
const getAllIncidents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const incidents = await Incident.find(filter).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// READ ONE: GET /api/incidents/:id
const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (err) {
    console.error('Error fetching incident:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE: PUT /api/incidents/:id
const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    Object.keys(updates).forEach((key) => {
      incident[key] = updates[key];
    });

    await incident.save();
    res.json(incident);
  } catch (err) {
    console.error('Error updating incident:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CLOSE: PATCH /api/incidents/:id/close
const closeIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { incidentEndDate } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = 'closed';
    incident.incidentEndDate = incidentEndDate || new Date();

    await incident.save();
    res.json(incident);
  } catch (err) {
    console.error('Error closing incident:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 👇 THIS IS IMPORTANT
module.exports = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  closeIncident
};
