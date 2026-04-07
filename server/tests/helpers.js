const request = require('supertest');
const app = require('../src/app');

const createFamily = async (name = 'Test Family', pin = '1234') => {
  const res = await request(app)
    .post('/api/family/register')
    .send({ name, pin });
  return res.body.data;
};

const loginFamily = async (familyId) => {
  const res = await request(app)
    .post('/api/family/login')
    .send({ familyId });
  return res.body.data.token;
};

const getParentToken = async (token, pin = '1234') => {
  const res = await request(app)
    .post('/api/family/verify-pin')
    .set('Authorization', `Bearer ${token}`)
    .send({ pin });
  return res.body.data.token;
};

const authedRequest = (method, path, token) => {
  return request(app)[method](path).set('Authorization', `Bearer ${token}`);
};

module.exports = { createFamily, loginFamily, getParentToken, authedRequest };
