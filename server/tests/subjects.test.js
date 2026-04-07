const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Subject API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('GET /api/subjects', () => {
    it('should return default subjects for new family', async () => {
      const res = await authedRequest('get', '/api/subjects', token);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      const names = res.body.data.map((s) => s.name);
      expect(names).toContain('数学');
      expect(names).toContain('语文');
      expect(names).toContain('英语');
    });
  });

  describe('POST /api/subjects', () => {
    it('should create a new subject (parent only)', async () => {
      const res = await authedRequest('post', '/api/subjects', parentToken)
        .send({ name: '科学', icon: '🔬', taskTemplates: [{ name: '实验报告', points: 10 }] });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('科学');
      expect(res.body.data.taskTemplates).toHaveLength(1);
    });

    it('should reject non-parent user', async () => {
      const res = await authedRequest('post', '/api/subjects', token)
        .send({ name: '科学', icon: '🔬' });

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/subjects/:id', () => {
    it('should update a subject', async () => {
      const createRes = await authedRequest('post', '/api/subjects', parentToken)
        .send({ name: '科学', icon: '🔬' });

      const id = createRes.body.data._id;

      const res = await authedRequest('put', `/api/subjects/${id}`, parentToken)
        .send({ name: '自然科学', taskTemplates: [{ name: '观察日记', points: 5 }] });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('自然科学');
      expect(res.body.data.taskTemplates).toHaveLength(1);
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    it('should delete a non-default subject', async () => {
      const createRes = await authedRequest('post', '/api/subjects', parentToken)
        .send({ name: '科学', icon: '🔬' });

      const id = createRes.body.data._id;

      const res = await authedRequest('delete', `/api/subjects/${id}`, parentToken);
      expect(res.status).toBe(200);

      const listRes = await authedRequest('get', '/api/subjects', token);
      const names = listRes.body.data.map((s) => s.name);
      expect(names).not.toContain('科学');
    });
  });
});
