const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAchievementsWithProgress } = require('../services/achievementService');
const { success, error } = require('../helpers/response');

router.get('/', auth, async (req, res) => {
  try {
    const achievements = await getAchievementsWithProgress(req.familyId);
    res.json(success(achievements));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch achievements'));
  }
});

module.exports = router;
