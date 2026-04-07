const request = require('supertest');
const app = require('../src/app');
const Achievement = require('../src/models/Achievement');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

const seedAchievements = async () => {
  await Achievement.insertMany([
    {
      type: 'persistence',
      title: '连续7天',
      description: '连续7天有学习记录',
      icon: '🔥',
      condition: { type: 'streak', target: 7 },
      isHidden: false,
    },
    {
      type: 'learning',
      title: '初次记录',
      description: '完成第一条学习记录',
      icon: '⭐',
      condition: { type: 'count', target: 1 },
      isHidden: false,
    },
    {
      type: 'learning',
      title: '学习达人',
      description: '累计完成10条学习记录',
      icon: '🏆',
      condition: { type: 'count', target: 10 },
      isHidden: false,
    },
    {
      type: 'pet',
      title: '宠物收藏家',
      description: '拥有3只宠物',
      icon: '🐾',
      condition: { type: 'pet_count', target: 3 },
      isHidden: true,
    },
  ]);
};

describe('Achievement API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
    await seedAchievements();
  });

  describe('GET /api/achievements', () => {
    it('should return achievements with progress', async () => {
      const res = await authedRequest('get', '/api/achievements', token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);

      const first = res.body.data.find((a) => a.title === '初次记录');
      expect(first.isUnlocked).toBe(false);
      expect(first.progress).toBe(0);
    });
  });

  describe('Achievement auto-detection', () => {
    it('should unlock "初次记录" after first record', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      const res = await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Test', points: 10 });

      expect(res.body.data.newAchievements).toBeDefined();
      expect(res.body.data.newAchievements.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.newAchievements[0].title).toBe('初次记录');

      const achRes = await authedRequest('get', '/api/achievements', token);
      const first = achRes.body.data.find((a) => a.title === '初次记录');
      expect(first.isUnlocked).toBe(true);
    });

    it('should track progress for "学习达人"', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      for (let i = 0; i < 3; i++) {
        await authedRequest('post', '/api/records', parentToken)
          .send({ subjectId, taskName: `Task ${i}`, points: 5 });
      }

      const achRes = await authedRequest('get', '/api/achievements', token);
      const learner = achRes.body.data.find((a) => a.title === '学习达人');
      expect(learner.progress).toBe(3);
      expect(learner.isUnlocked).toBe(false);
    });
  });
});
