const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Family = require('../models/Family');
const auth = require('../middleware/auth');
const { success, error } = require('../helpers/response');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

router.post('/register', async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Family name is required'));
    }
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json(error('INVALID_PIN', 'PIN must be exactly 4 digits'));
    }

    const family = new Family({ name: name.trim(), pin });
    await family.save();

    res.status(201).json(success({
      familyId: family.familyId,
      name: family.name,
    }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Registration failed'));
  }
});

router.post('/login', async (req, res) => {
  try {
    const { familyId } = req.body;

    if (!familyId) {
      return res.status(400).json(error('INVALID_INPUT', 'Family ID is required'));
    }

    const family = await Family.findOne({ familyId });
    if (!family) {
      return res.status(404).json(error('NOT_FOUND', 'Family not found'));
    }

    const token = jwt.sign(
      { familyId: family._id.toString(), isParent: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json(success({ token, name: family.name, initialPetChosen: family.initialPetChosen }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Login failed'));
  }
});

router.post('/verify-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json(error('INVALID_INPUT', 'PIN is required'));
    }

    const family = await Family.findById(req.familyId);
    if (!family) {
      return res.status(404).json(error('NOT_FOUND', 'Family not found'));
    }

    const isMatch = await family.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json(error('WRONG_PIN', 'Incorrect PIN'));
    }

    const token = jwt.sign(
      { familyId: family._id.toString(), isParent: true },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json(success({ token }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'PIN verification failed'));
  }
});

module.exports = router;
