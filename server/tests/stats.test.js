const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Stats API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('GET /api/stats', () => {
    it('should return stats for family with records', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      for (let i = 0; i < 3; i++) {
        await authedRequest('post', '/api/records', parentToken)
          .send({ subjectId, taskName: `Task ${i}`, points: 10 });
      }

      const res = await authedRequest('get', '/api/stats', token);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRecords).toBe(3);
      expect(res.body.data.totalStarsEarned).toBe(30);
      expect(res.body.data.subjectBreakdown).toBeDefined();
      expect(res.body.data.subjectBreakdown.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty stats for new family', async () => {
      const res = await authedRequest('get', '/api/stats', token);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRecords).toBe(0);
      expect(res.body.data.totalStarsEarned).toBe(0);
    });
  });
});
