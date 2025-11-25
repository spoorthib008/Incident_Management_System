// server/testDb.js
require('dotenv').config();
const connectDB = require('./config/database');
const Incident = require('./models/Incident');

const run = async () => {
  await connectDB();

  try {
    const incident = await Incident.create({
      type: 'Network',
      incidentStartDate: new Date(),
      description: 'Test incident',
      remarks: 'Just a DB test'
    });

    console.log('Sample incident created:', incident);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
