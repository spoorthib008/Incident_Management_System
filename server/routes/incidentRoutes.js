// server/routes/incidentRoutes.js
const express = require('express');
const router = express.Router();

const {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  closeIncident
} = require('../controllers/incidentController');

// 🚫 WRONG examples (cause your error):
// router.post('/', incidentController);            // object, not function
// router.post('/', createIncident());              // calls function, passes promise
// router.post('/', undefined);                     // undefined

// ✅ CORRECT:
router.post('/', createIncident);
router.get('/', getAllIncidents);
router.get('/:id', getIncidentById);
router.put('/:id', updateIncident);
router.patch('/:id/close', closeIncident);

module.exports = router;
