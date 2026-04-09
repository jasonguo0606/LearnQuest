import api from '../lib/api';

export const getAchievements = async () => {
  const res = await api.get('/achievements');
  return res.data.data;
};
