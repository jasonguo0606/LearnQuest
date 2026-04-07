const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Redemption API', () => {
  let token, parentToken, rewardId;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);

    const rewardRes = await authedRequest('post', '/api/rewards', parentToken)
      .send({ name: '看电影', cost: 20, icon: '🎬' });
    rewardId = rewardRes.body.data._id;

    const subjectsRes = await authedRequest('get', '/api/subjects', token);
    const subjectId = subjectsRes.body.data[0]._id;
    await authedRequest('post', '/api/records', parentToken)
      .send({ subjectId, taskName: 'Task', points: 30 });
  });

  describe('POST /api/redemptions', () => {
    it('should redeem reward and deduct stars', async () => {
      const res = await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.cost).toBe(20);

      const balanceRes = await authedRequest('get', '/api/stars/balance', token);
      expect(balanceRes.body.data.balance).toBe(10);
    });

    it('should reject redemption with insufficient stars', async () => {
      const expensiveRes = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: 'PS5', cost: 1000 });

      const res = await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId: expensiveRes.body.data._id });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_STARS');
    });
  });

  describe('GET /api/redemptions?status=pending', () => {
    it('should return pending redemptions', async () => {
      await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId });

      const res = await authedRequest('get', '/api/redemptions?status=pending', parentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('pending');
    });
  });

  describe('PUT /api/redemptions/:id/confirm', () => {
    it('should confirm a pending redemption (parent only)', async () => {
      const redeemRes = await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId });

      const redemptionId = redeemRes.body.data._id;

      const res = await authedRequest('put', `/api/redemptions/${redemptionId}/confirm`, parentToken);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
    });
  });
});
