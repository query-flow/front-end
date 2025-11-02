// src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // porque o Vite vai proxyar pra http://127.0.0.1:8000
});

// toda request vai com o token, se tiver
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
