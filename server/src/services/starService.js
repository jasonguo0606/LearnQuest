const StarTransaction = require('../models/StarTransaction');

const getBalance = async (familyId) => {
  const result = await StarTransaction.aggregate([
    { $match: { familyId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

const addTransaction = async ({ familyId, type, amount, referenceId, description }) => {
  const tx = new StarTransaction({ familyId, type, amount, referenceId, description });
  await tx.save();
  return tx;
};

const hasEnoughStars = async (familyId, cost) => {
  const balance = await getBalance(familyId);
  return balance >= cost;
};

module.exports = { getBalance, addTransaction, hasEnoughStars };
