const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Family API', () => {
  describe('POST /api/family/register', () => {
    it('should register a new family and return familyId', async () => {
      const res = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.familyId).toBeDefined();
      expect(res.body.data.name).toBe('Guo Family');
    });

    it('should reject registration without name', async () => {
      const res = await request(app)
        .post('/api/family/register')
        .send({ pin: '1234' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with non-4-digit pin', async () => {
      const res = await request(app)
        .post('/api/family/register')
        .send({ name: 'Test', pin: '12' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/family/login', () => {
    it('should login with familyId and return JWT', async () => {
      const regRes = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      const familyId = regRes.body.data.familyId;

      const res = await request(app)
        .post('/api/family/login')
        .send({ familyId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with invalid familyId', async () => {
      const res = await request(app)
        .post('/api/family/login')
        .send({ familyId: 'nonexistent' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/family/verify-pin', () => {
    it('should return parent token with correct pin', async () => {
      const regRes = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      const loginRes = await request(app)
        .post('/api/family/login')
        .send({ familyId: regRes.body.data.familyId });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/family/verify-pin')
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject incorrect pin', async () => {
      const regRes = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      const loginRes = await request(app)
        .post('/api/family/login')
        .send({ familyId: regRes.body.data.familyId });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/family/verify-pin')
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '9999' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
