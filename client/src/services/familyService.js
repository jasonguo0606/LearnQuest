import api from '../lib/api';

export const register = async (name, pin) => {
  const res = await api.post('/family/register', { name, pin });
  return res.data.data;
};

export const login = async (familyId) => {
  const res = await api.post('/family/login', { familyId });
  return res.data.data;
};

export const verifyPin = async (pin) => {
  const res = await api.post('/family/verify-pin', { pin });
  return res.data.data;
};
