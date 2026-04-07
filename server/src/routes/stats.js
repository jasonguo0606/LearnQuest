const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { getBalance } = require('../services/starService');
const { success, error } = require('../helpers/response');

router.get('/stars/balance', auth, async (req, res) => {
  try {
    const balance = await getBalance(new mongoose.Types.ObjectId(req.familyId));
    res.json(success({ balance }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch balance'));
  }
});

module.exports = router;
