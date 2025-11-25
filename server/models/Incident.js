// server/models/Incident.js
const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    incidentStartDate: {
      type: Date,
      required: true
    },
    incidentEndDate: {
      type: Date
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
