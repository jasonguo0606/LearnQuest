const router = require('express').Router();
const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const Family = require('../models/Family');
const auth = require('../middleware/auth');
const { PET_TYPES, FEED_COST } = require('../config/pets');
const { feedPet, updateMoods } = require('../services/petService');
const { addTransaction, hasEnoughStars } = require('../services/starService');
const { success, error } = require('../helpers/response');

router.get('/', auth, async (req, res) => {
  try {
    await updateMoods(req.familyId);
    const owned = await Pet.find({ familyId: req.familyId });
    const ownedTypes = owned.map((p) => p.type);

    const available = Object.entries(PET_TYPES).map(([type, config]) => ({
      type,
      ...config,
      owned: ownedTypes.includes(type),
    }));

    res.json(success({ owned, available }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch pets'));
  }
});

router.post('/choose', auth, async (req, res) => {
  try {
    const { type, name } = req.body;

    const family = await Family.findById(req.familyId);
    if (family.initialPetChosen) {
      return res.status(400).json(error('ALREADY_CHOSEN', 'Initial pet already chosen'));
    }

    const petConfig = PET_TYPES[type];
    if (!petConfig || petConfig.unlockCost > 0) {
      return res.status(400).json(error('INVALID_PET', 'Invalid initial pet type'));
    }

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Pet name is required'));
    }

    const pet = new Pet({
      familyId: req.familyId,
      type,
      name: name.trim(),
      isActive: true,
    });
    await pet.save();

    await Family.findByIdAndUpdate(req.familyId, { $set: { initialPetChosen: true } });

    res.status(201).json(success(pet));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to choose pet'));
  }
});

router.post('/:id/feed', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!pet) {
      return res.status(404).json(error('NOT_FOUND', 'Pet not found'));
    }

    const familyObjId = new mongoose.Types.ObjectId(req.familyId);
    const enough = await hasEnoughStars(familyObjId, FEED_COST);
    if (!enough) {
      return res.status(400).json(error('INSUFFICIENT_STARS', 'Not enough stars to feed pet'));
    }

    await addTransaction({
      familyId: familyObjId,
      type: 'feed',
      amount: -FEED_COST,
      referenceId: pet._id,
      description: `Feed ${pet.name} -${FEED_COST}`,
    });

    const result = await feedPet(pet);

    res.json(success(result));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to feed pet'));
  }
});

router.post('/unlock', auth, async (req, res) => {
  try {
    const { type, name } = req.body;

    const petConfig = PET_TYPES[type];
    if (!petConfig) {
      return res.status(400).json(error('INVALID_PET', 'Unknown pet type'));
    }

    const existing = await Pet.findOne({ familyId: req.familyId, type });
    if (existing) {
      return res.status(400).json(error('ALREADY_OWNED', 'Pet already owned'));
    }

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Pet name is required'));
    }

    if (petConfig.unlockCost > 0) {
      const familyObjId = new mongoose.Types.ObjectId(req.familyId);
      const enough = await hasEnoughStars(familyObjId, petConfig.unlockCost);
      if (!enough) {
        return res.status(400).json(error('INSUFFICIENT_STARS', 'Not enough stars to unlock pet'));
      }

      await addTransaction({
        familyId: familyObjId,
        type: 'unlock',
        amount: -petConfig.unlockCost,
        referenceId: null,
        description: `Unlock ${petConfig.name} -${petConfig.unlockCost}`,
      });
    }

    const pet = new Pet({
      familyId: req.familyId,
      type,
      name: name.trim(),
      isActive: false,
    });
    await pet.save();

    res.status(201).json(success(pet));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to unlock pet'));
  }
});

router.put('/:id/active', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!pet) {
      return res.status(404).json(error('NOT_FOUND', 'Pet not found'));
    }

    await Pet.updateMany({ familyId: req.familyId }, { $set: { isActive: false } });
    const updated = await Pet.findByIdAndUpdate(
      pet._id,
      { $set: { isActive: true } },
      { new: true }
    );

    res.json(success(updated));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to switch pet'));
  }
});

module.exports = router;
