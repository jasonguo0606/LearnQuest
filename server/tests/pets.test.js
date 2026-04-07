const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Pet API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('GET /api/pets', () => {
    it('should return available pet types for new family', async () => {
      const res = await authedRequest('get', '/api/pets', token);

      expect(res.status).toBe(200);
      expect(res.body.data.owned).toHaveLength(0);
      expect(res.body.data.available.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/pets/choose', () => {
    it('should let child choose initial pet', async () => {
      const res = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('cat');
      expect(res.body.data.name).toBe('小花');
      expect(res.body.data.level).toBe(1);
      expect(res.body.data.isActive).toBe(true);
    });

    it('should reject choosing twice', async () => {
      await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      const res = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'dog', name: '小黑' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/pets/:id/feed', () => {
    it('should feed pet, deduct stars, and gain exp', async () => {
      // Earn some stars first
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;
      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Test', points: 20 });

      // Choose pet
      const petRes = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      const petId = petRes.body.data._id;

      // Feed pet (costs 5 stars by default)
      const res = await authedRequest('post', `/api/pets/${petId}/feed`, token);

      expect(res.status).toBe(200);
      expect(res.body.data.pet.exp).toBeGreaterThan(0);

      // Balance should decrease
      const balanceRes = await authedRequest('get', '/api/stars/balance', token);
      expect(balanceRes.body.data.balance).toBe(15); // 20 - 5
    });

    it('should reject feeding with insufficient stars', async () => {
      const petRes = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      const petId = petRes.body.data._id;

      const res = await authedRequest('post', `/api/pets/${petId}/feed`, token);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_STARS');
    });
  });

  describe('PUT /api/pets/:id/active', () => {
    it('should switch active pet', async () => {
      // Choose first pet
      await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      // Earn stars and unlock second pet
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;
      for (let i = 0; i < 5; i++) {
        await authedRequest('post', '/api/records', parentToken)
          .send({ subjectId, taskName: 'Task', points: 20 });
      }

      // Unlock second pet (dog has unlockCost 0, but it's an initial choice type not yet owned)
      const unlockRes = await authedRequest('post', '/api/pets/unlock', token)
        .send({ type: 'dog', name: '小黑' });

      const dogId = unlockRes.body.data._id;

      // Switch to dog
      const res = await authedRequest('put', `/api/pets/${dogId}/active`, token);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(true);
    });
  });
});
