import api from '../lib/api';

export const getPets = async () => {
  const res = await api.get('/pets');
  return res.data.data;
};

export const choosePet = async (type, name) => {
  const res = await api.post('/pets/unlock', { type, name });
  return res.data.data;
};

export const switchActivePet = async (petId) => {
  const res = await api.put(`/pets/${petId}/active`);
  return res.data.data;
};

export const feedPet = async (petId) => {
  const res = await api.post(`/pets/${petId}/feed`);
  return res.data.data;
};
