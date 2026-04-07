const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { getBalance } = require('../services/starService');
const Record = require('../models/Record');
const StarTransaction = require('../models/StarTransaction');
const { success, error } = require('../helpers/response');

router.get('/stars/balance', auth, async (req, res) => {
  try {
    const balance = await getBalance(new mongoose.Types.ObjectId(req.familyId));
    res.json(success({ balance }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch balance'));
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const familyObjId = new mongoose.Types.ObjectId(req.familyId);

    const totalRecords = await Record.countDocuments({ familyId: req.familyId });

    const earnedResult = await StarTransaction.aggregate([
      { $match: { familyId: familyObjId, type: 'earn' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalStarsEarned = earnedResult.length > 0 ? earnedResult[0].total : 0;

    const subjectBreakdown = await Record.aggregate([
      { $match: { familyId: familyObjId } },
      {
        $group: {
          _id: '$subjectId',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $project: {
          subjectName: '$subject.name',
          subjectIcon: '$subject.icon',
          count: 1,
          totalPoints: 1,
        },
      },
    ]);

    res.json(success({
      totalRecords,
      totalStarsEarned,
      subjectBreakdown,
    }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch stats'));
  }
});

module.exports = router;
