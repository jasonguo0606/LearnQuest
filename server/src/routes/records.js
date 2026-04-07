const router = require('express').Router();
const mongoose = require('mongoose');
const Record = require('../models/Record');
const auth = require('../middleware/auth');
const parent = require('../middleware/parent');
const { addTransaction } = require('../services/starService');
const { checkAchievements } = require('../services/achievementService');
const { success, error } = require('../helpers/response');

router.post('/', auth, parent, async (req, res) => {
  try {
    const { subjectId, taskName, points, note, date } = req.body;

    if (!subjectId || !taskName || !points) {
      return res.status(400).json(error('INVALID_INPUT', 'subjectId, taskName, and points are required'));
    }
    if (points < 1) {
      return res.status(400).json(error('INVALID_INPUT', 'Points must be at least 1'));
    }

    const record = new Record({
      familyId: req.familyId,
      subjectId,
      taskName,
      points,
      note: note || '',
      date: date || new Date(),
    });
    await record.save();

    await addTransaction({
      familyId: new mongoose.Types.ObjectId(req.familyId),
      type: 'earn',
      amount: points,
      referenceId: record._id,
      description: `${taskName} +${points}`,
    });

    const newAchievements = await checkAchievements(req.familyId);

    res.status(201).json(success({ record, newAchievements }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to create record'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { familyId: req.familyId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const records = await Record.find(query).sort({ date: -1 }).populate('subjectId', 'name icon');
    res.json(success(records));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch records'));
  }
});

router.get('/calendar', auth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json(error('INVALID_INPUT', 'month parameter required (YYYY-MM)'));
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const records = await Record.aggregate([
      {
        $match: {
          familyId: new mongoose.Types.ObjectId(req.familyId),
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalPoints: { $sum: '$points' },
          count: { $sum: 1 },
        },
      },
    ]);

    const calendar = {};
    for (const r of records) {
      calendar[r._id] = { totalPoints: r.totalPoints, count: r.count };
    }

    res.json(success(calendar));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch calendar data'));
  }
});

module.exports = router;
