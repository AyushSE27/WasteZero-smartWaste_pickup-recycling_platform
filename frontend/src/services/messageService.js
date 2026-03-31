import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const getUsers = (token) => {
  return axios.get(`${API}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMessages = (userId, token) => {
  return axios.get(`${API}/api/messages/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const sendMessage = (data, token) => {
  return axios.post(`${API}/api/messages`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
