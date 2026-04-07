const PET_TYPES = {
  cat: {
    name: '小猫咪',
    description: '温柔可爱的小猫咪',
    unlockCost: 0,
  },
  dog: {
    name: '小狗狗',
    description: '活泼忠诚的小狗狗',
    unlockCost: 0,
  },
  rabbit: {
    name: '小兔子',
    description: '蹦蹦跳跳的小兔子',
    unlockCost: 0,
  },
  dragon: {
    name: '小火龙',
    description: '神秘的小火龙',
    unlockCost: 50,
  },
  unicorn: {
    name: '独角兽',
    description: '闪闪发光的独角兽',
    unlockCost: 100,
  },
};

const FEED_COST = 5;
const FEED_EXP = 10;

const LEVEL_THRESHOLDS = [
  0, 30, 70, 120, 180, 250, 340, 450, 580, 730,
  900, 1100, 1330, 1600, 1900, 2250, 2650, 3100, 3600, 4200,
];

const MAX_LEVEL = LEVEL_THRESHOLDS.length;

const getLevelForExp = (exp) => {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (exp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

const HUNGRY_AFTER_DAYS = 3;

module.exports = { PET_TYPES, FEED_COST, FEED_EXP, LEVEL_THRESHOLDS, MAX_LEVEL, getLevelForExp, HUNGRY_AFTER_DAYS };
