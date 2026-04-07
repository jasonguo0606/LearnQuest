const router = require('express').Router();
const Reward = require('../models/Reward');
const auth = require('../middleware/auth');
const parent = require('../middleware/parent');
const { success, error } = require('../helpers/response');

router.get('/', auth, async (req, res) => {
  try {
    const rewards = await Reward.find({ familyId: req.familyId, isActive: true });
    res.json(success(rewards));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch rewards'));
  }
});

router.post('/', auth, parent, async (req, res) => {
  try {
    const { name, cost, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Reward name is required'));
    }
    if (!cost || cost < 1) {
      return res.status(400).json(error('INVALID_INPUT', 'Cost must be at least 1'));
    }

    const reward = new Reward({
      familyId: req.familyId,
      name: name.trim(),
      cost,
      icon: icon || '',
    });
    await reward.save();

    res.status(201).json(success(reward));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to create reward'));
  }
});

router.put('/:id', auth, parent, async (req, res) => {
  try {
    const { name, cost, icon, isActive } = req.body;

    const reward = await Reward.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!reward) {
      return res.status(404).json(error('NOT_FOUND', 'Reward not found'));
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (cost !== undefined) updates.cost = cost;
    if (icon !== undefined) updates.icon = icon;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await Reward.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: 'after' }
    );

    res.json(success(updated));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to update reward'));
  }
});

router.delete('/:id', auth, parent, async (req, res) => {
  try {
    const reward = await Reward.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!reward) {
      return res.status(404).json(error('NOT_FOUND', 'Reward not found'));
    }

    await Reward.findByIdAndDelete(req.params.id);
    res.json(success({ deleted: true }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to delete reward'));
  }
});

module.exports = router;
