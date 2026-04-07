const router = require('express').Router();
const mongoose = require('mongoose');
const Redemption = require('../models/Redemption');
const Reward = require('../models/Reward');
const auth = require('../middleware/auth');
const parent = require('../middleware/parent');
const { addTransaction, hasEnoughStars } = require('../services/starService');
const { success, error } = require('../helpers/response');

router.post('/', auth, async (req, res) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json(error('INVALID_INPUT', 'rewardId is required'));
    }

    const reward = await Reward.findOne({ _id: rewardId, familyId: req.familyId, isActive: true });
    if (!reward) {
      return res.status(404).json(error('NOT_FOUND', 'Reward not found'));
    }

    const familyObjId = new mongoose.Types.ObjectId(req.familyId);
    const enough = await hasEnoughStars(familyObjId, reward.cost);
    if (!enough) {
      return res.status(400).json(error('INSUFFICIENT_STARS', '星星不够哦，再努力一下吧！'));
    }

    const redemption = new Redemption({
      familyId: req.familyId,
      rewardId: reward._id,
      rewardName: reward.name,
      cost: reward.cost,
    });
    await redemption.save();

    await addTransaction({
      familyId: familyObjId,
      type: 'redeem',
      amount: -reward.cost,
      referenceId: redemption._id,
      description: `Redeem ${reward.name} -${reward.cost}`,
    });

    res.status(201).json(success(redemption));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to redeem reward'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const query = { familyId: req.familyId };
    const VALID_STATUSES = ['pending', 'confirmed'];
    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return res.status(400).json(error('INVALID_INPUT', 'Invalid status value'));
      }
      query.status = req.query.status;
    }

    const redemptions = await Redemption.find(query).sort({ createdAt: -1 });
    res.json(success(redemptions));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch redemptions'));
  }
});

router.put('/:id/confirm', auth, parent, async (req, res) => {
  try {
    const redemption = await Redemption.findOne({
      _id: req.params.id,
      familyId: req.familyId,
      status: 'pending',
    });

    if (!redemption) {
      return res.status(404).json(error('NOT_FOUND', 'Pending redemption not found'));
    }

    const updated = await Redemption.findByIdAndUpdate(
      redemption._id,
      { $set: { status: 'confirmed', confirmedAt: new Date() } },
      { returnDocument: 'after' }
    );

    res.json(success(updated));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to confirm redemption'));
  }
});

module.exports = router;
