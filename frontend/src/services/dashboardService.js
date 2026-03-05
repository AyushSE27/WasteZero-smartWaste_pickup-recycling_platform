import axios from "axios";

const API = "http://localhost:5000/api/dashboard";

export const getDashboardStats = (token) =>
  axios.get(`${API}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });