import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const registerUser = (data) => {
  return axios.post(`${API}/register`, data);
};

export const loginUser = (data) => {
  return axios.post(`${API}/login`, data);
};

export const getProfile = (token) => {
  return axios.get(`${API}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfile = (data, token) => {
  return axios.put(`${API}/profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changePassword = (data, token) =>
  axios.put(`${API}/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });