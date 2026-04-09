import api from '../lib/api';

export const getBalance = async () => {
  const res = await api.get('/stars/balance');
  return res.data.data.balance;
};

export const getStats = async () => {
  const res = await api.get('/stats');
  return res.data.data;
};
