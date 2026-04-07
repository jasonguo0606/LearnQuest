const Achievement = require('../models/Achievement');
const { DEFAULT_ACHIEVEMENTS } = require('../config/achievements');

const seedAchievements = async () => {
  const count = await Achievement.countDocuments();
  if (count > 0) return;

  await Achievement.insertMany(DEFAULT_ACHIEVEMENTS);
  console.log(`Seeded ${DEFAULT_ACHIEVEMENTS.length} achievements`);
};

module.exports = seedAchievements;
