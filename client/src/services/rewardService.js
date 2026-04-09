import api from '../lib/api';

export const getRewards = async () => {
  const res = await api.get('/rewards');
  return res.data.data;
};

export const createReward = async (data) => {
  const res = await api.post('/rewards', data);
  return res.data.data;
};

export const updateReward = async (id, data) => {
  const res = await api.put(`/rewards/${id}`, data);
  return res.data.data;
};

export const deleteReward = async (id) => {
  const res = await api.delete(`/rewards/${id}`);
  return res.data.data;
};
