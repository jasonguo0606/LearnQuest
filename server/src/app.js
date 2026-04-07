const express = require('express');
const cors = require('cors');

const familyRoutes = require('./routes/family');
const subjectRoutes = require('./routes/subjects');
const recordRoutes = require('./routes/records');
const petRoutes = require('./routes/pets');
const achievementRoutes = require('./routes/achievements');
const rewardRoutes = require('./routes/rewards');
const redemptionRoutes = require('./routes/redemptions');
const statRoutes = require('./routes/stats');
const { error } = require('./helpers/response');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/family', familyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api', statRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json(error('SERVER_ERROR', 'Internal server error'));
});

module.exports = app;
