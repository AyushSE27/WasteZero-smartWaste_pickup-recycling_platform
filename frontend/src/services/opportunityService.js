import axios from "axios";

const API = "http://localhost:5000/api/opportunities";

export const getOpportunities = (token) =>
  axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createOpportunity = (data, token) =>
  axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const updateOpportunity = (id, data, token) =>
  axios.put(`${API}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteOpportunity = (id, token) =>
  axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteAdminOpportunity = (id, token) =>
  axios.delete(`http://localhost:5000/api/admin/opportunities/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getSingleOpportunity = (id) =>
  axios.get(`${API}/${id}`);
