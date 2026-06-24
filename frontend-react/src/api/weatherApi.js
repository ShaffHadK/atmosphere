import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: BASE_URL,
});

export const getLiveWeather = async (city) => {
  const response = await api.get('/weather/live', { params: { city } });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/weather/');
  return response.data;
};

export const createRecord = async (recordData) => {
  const response = await api.post('/weather/', recordData);
  return response.data;
};

export const updateRecord = async (id, data) => {
  const response = await api.put(`/weather/${id}`, data);
  return response.data;
};

export const deleteRecord = async (id) => {
  const response = await api.delete(`/weather/${id}`);
  return response.data;
};

export const getExportUrl = () => {
  return `${BASE_URL}/weather/export/csv`;
};
