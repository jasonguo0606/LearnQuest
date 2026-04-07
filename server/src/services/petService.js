const Pet = require('../models/Pet');
const { getLevelForExp, FEED_COST, FEED_EXP, HUNGRY_AFTER_DAYS } = require('../config/pets');

const feedPet = async (pet) => {
  const newExp = pet.exp + FEED_EXP;
  const newLevel = getLevelForExp(newExp);

  const updated = await Pet.findByIdAndUpdate(
    pet._id,
    {
      $set: {
        exp: newExp,
        level: newLevel,
        mood: 'happy',
        lastFedAt: new Date(),
      },
    },
    { new: true }
  );

  return { pet: updated, leveledUp: newLevel > pet.level };
};

const updateMoods = async (familyId) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HUNGRY_AFTER_DAYS);

  await Pet.updateMany(
    { familyId, lastFedAt: { $lt: cutoff }, mood: { $ne: 'hungry' } },
    { $set: { mood: 'hungry' } }
  );
};

module.exports = { feedPet, updateMoods, FEED_COST };
