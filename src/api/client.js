import axios from 'axios';
const API_URL = 'http://localhost:8000/api';
const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
client.interceptors.response.use(r => r, async err => {
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    try {
      const refresh = localStorage.getItem('refresh');
      const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh });
      localStorage.setItem('access', data.access);
      orig.headers.Authorization = `Bearer ${data.access}`;
      return client(orig);
    } catch { localStorage.clear(); window.location.href = '/login'; }
  }
  return Promise.reject(err);
});
export default client;
