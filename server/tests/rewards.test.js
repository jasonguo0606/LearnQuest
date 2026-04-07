const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Reward API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('POST /api/rewards', () => {
    it('should create a reward (parent only)', async () => {
      const res = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30, icon: '🎬' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('看电影');
      expect(res.body.data.cost).toBe(30);
    });

    it('should reject non-parent', async () => {
      const res = await authedRequest('post', '/api/rewards', token)
        .send({ name: '看电影', cost: 30 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/rewards', () => {
    it('should return rewards list', async () => {
      await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30, icon: '🎬' });

      await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '买玩具', cost: 50, icon: '🧸' });

      const res = await authedRequest('get', '/api/rewards', token);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('PUT /api/rewards/:id', () => {
    it('should update a reward', async () => {
      const createRes = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30 });

      const id = createRes.body.data._id;

      const res = await authedRequest('put', `/api/rewards/${id}`, parentToken)
        .send({ name: '看电影(IMAX)', cost: 50 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('看电影(IMAX)');
      expect(res.body.data.cost).toBe(50);
    });
  });

  describe('DELETE /api/rewards/:id', () => {
    it('should delete a reward', async () => {
      const createRes = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30 });

      const id = createRes.body.data._id;

      const res = await authedRequest('delete', `/api/rewards/${id}`, parentToken);
      expect(res.status).toBe(200);
    });
  });
});
