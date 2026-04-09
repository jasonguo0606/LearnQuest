import api from '../lib/api';

export const redeem = async (rewardId) => {
  const res = await api.post('/redemptions', { rewardId });
  return res.data.data;
};

export const getRedemptions = async (status) => {
  const url = status ? `/redemptions?status=${status}` : '/redemptions';
  const res = await api.get(url);
  return res.data.data;
};

export const confirmRedemption = async (id) => {
  const res = await api.put(`/redemptions/${id}/confirm`);
  return res.data.data;
};
