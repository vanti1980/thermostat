import axios, { AxiosInstance } from 'axios';

const devServer = 'webpackHotUpdatethermostat' in window;
const apiClient: AxiosInstance = axios.create({
  baseURL: `${devServer ? 'http://localhost:3000' : ''}/api`,
  headers: {
    'Content-Type': 'application/json',
    patch: {
      'Content-Type': 'application/json',
    },
    post: {
      'Content-Type': 'application/json',
    },
    put: {
      'Content-Type': 'application/json',
    },
  },
});

export default apiClient;
