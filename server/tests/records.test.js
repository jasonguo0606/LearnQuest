const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Records & Stars API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('POST /api/records', () => {
    it('should create a record and award stars (parent only)', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      const res = await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: '课本习题全对', points: 10 });

      expect(res.status).toBe(201);
      expect(res.body.data.record.points).toBe(10);
      expect(res.body.data.record.taskName).toBe('课本习题全对');
    });

    it('should reject non-parent user', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      const res = await authedRequest('post', '/api/records', token)
        .send({ subjectId, taskName: 'Test', points: 5 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/stars/balance', () => {
    it('should return 0 for new family', async () => {
      const res = await authedRequest('get', '/api/stars/balance', token);

      expect(res.status).toBe(200);
      expect(res.body.data.balance).toBe(0);
    });

    it('should reflect stars earned from records', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 1', points: 10 });

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 2', points: 5 });

      const res = await authedRequest('get', '/api/stars/balance', token);
      expect(res.body.data.balance).toBe(15);
    });
  });

  describe('GET /api/records', () => {
    it('should return records filtered by date range', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 1', points: 10 });

      const today = new Date().toISOString().split('T')[0];
      const res = await authedRequest('get', `/api/records?startDate=${today}&endDate=${today}`, token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/records/calendar', () => {
    it('should return calendar data for a month', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 1', points: 10 });

      const month = new Date().toISOString().slice(0, 7);
      const res = await authedRequest('get', `/api/records/calendar?month=${month}`, token);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      const dates = Object.keys(res.body.data);
      expect(dates.length).toBeGreaterThanOrEqual(1);
    });
  });
});
