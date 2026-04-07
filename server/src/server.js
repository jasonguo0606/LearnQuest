require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const seedAchievements = require('./scripts/seedAchievements');

const PORT = process.env.PORT || 3001;

connectDB().then(async () => {
  await seedAchievements();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
