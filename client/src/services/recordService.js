import api from '../lib/api';

export const getRecords = async (params = {}) => {
  const res = await api.get('/records', { params });
  return res.data.data;
};

export const getCalendar = async (month) => {
  const res = await api.get('/records/calendar', { params: { month } });
  return res.data.data;
};

export const getSubjects = async () => {
  const res = await api.get('/subjects');
  return res.data.data;
};

export const createRecord = async (data) => {
  const res = await api.post('/records', data);
  return res.data.data;
};
