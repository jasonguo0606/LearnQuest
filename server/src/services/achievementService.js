const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const FamilyAchievement = require('../models/FamilyAchievement');
const Record = require('../models/Record');
const Pet = require('../models/Pet');
const Subject = require('../models/Subject');

const checkAchievements = async (familyId) => {
  const familyObjId = new mongoose.Types.ObjectId(familyId);
  const achievements = await Achievement.find({});
  const newlyUnlocked = [];

  for (const achievement of achievements) {
    let fa = await FamilyAchievement.findOne({
      familyId: familyObjId,
      achievementId: achievement._id,
    });

    if (fa && fa.isUnlocked) continue;

    const progress = await calculateProgress(familyObjId, achievement);

    if (!fa) {
      fa = new FamilyAchievement({
        familyId: familyObjId,
        achievementId: achievement._id,
        progress,
        isUnlocked: false,
      });
    } else {
      fa.progress = progress;
    }

    if (progress >= achievement.condition.target) {
      fa.isUnlocked = true;
      fa.unlockedAt = new Date();
      newlyUnlocked.push({
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlocksPetType: achievement.unlocksPetType || null,
      });
    }

    await fa.save();
  }

  return newlyUnlocked;
};

const calculateProgress = async (familyId, achievement) => {
  const { type, subjectFilter, target } = achievement.condition;

  switch (type) {
    case 'count': {
      const query = { familyId };
      if (subjectFilter) {
        const subject = await Subject.findOne({ familyId, name: subjectFilter });
        if (!subject) return 0;
        query.subjectId = subject._id;
      }
      return Record.countDocuments(query);
    }

    case 'streak': {
      return calculateStreak(familyId);
    }

    case 'pet_level': {
      const topPet = await Pet.findOne({ familyId }).sort({ level: -1 });
      return topPet ? topPet.level : 0;
    }

    case 'pet_count': {
      return Pet.countDocuments({ familyId });
    }

    case 'all_subjects': {
      return (await checkAllSubjectsThisWeek(familyId)) ? 1 : 0;
    }

    default:
      return 0;
  }
};

const calculateStreak = async (familyId) => {
  const records = await Record.aggregate([
    { $match: { familyId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  if (records.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = records.map((r) => r._id);

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];

    if (dates.includes(expectedStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const checkAllSubjectsThisWeek = async (familyId) => {
  const subjects = await Subject.find({ familyId });
  if (subjects.length === 0) return false;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const subjectIds = subjects.map((s) => s._id);
  const coveredSubjects = await Record.distinct('subjectId', {
    familyId,
    date: { $gte: weekAgo },
    subjectId: { $in: subjectIds },
  });

  return coveredSubjects.length >= subjectIds.length;
};

const getAchievementsWithProgress = async (familyId) => {
  const familyObjId = new mongoose.Types.ObjectId(familyId);
  const achievements = await Achievement.find({});
  const familyAchievements = await FamilyAchievement.find({ familyId: familyObjId });
  const faMap = new Map(familyAchievements.map((fa) => [fa.achievementId.toString(), fa]));

  return achievements.map((a) => {
    const fa = faMap.get(a._id.toString());
    return {
      _id: a._id,
      type: a.type,
      title: a.isHidden && (!fa || !fa.isUnlocked) ? '???' : a.title,
      description: a.isHidden && (!fa || !fa.isUnlocked) ? '隐藏成就' : a.description,
      icon: a.isHidden && (!fa || !fa.isUnlocked) ? '❓' : a.icon,
      isHidden: a.isHidden,
      isUnlocked: fa ? fa.isUnlocked : false,
      progress: fa ? fa.progress : 0,
      target: a.condition.target,
      unlockedAt: fa ? fa.unlockedAt : null,
    };
  });
};

module.exports = { checkAchievements, getAchievementsWithProgress };
