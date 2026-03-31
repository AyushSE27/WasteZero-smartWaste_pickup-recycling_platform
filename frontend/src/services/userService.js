import axios from "axios";

const API = "http://localhost:5000/api/user";

const getAuthHeaders = (token, extraHeaders = {}) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  },
});

export const getUserSettings = (token) =>
  axios.get(`${API}/settings`, getAuthHeaders(token));

export const updateUserPreferences = (data, token) =>
  axios.put(`${API}/preferences`, data, getAuthHeaders(token));

export const updateUserLocation = (data, token) =>
  axios.put(`${API}/location`, data, getAuthHeaders(token));

export const uploadUserAvatar = (formData, token) =>
  axios.post(
    `${API}/upload-avatar`,
    formData,
    getAuthHeaders(token, { "Content-Type": "multipart/form-data" }),
  );

export const exportUserData = (token) =>
  axios.get(`${API}/export-data`, getAuthHeaders(token));

export const deleteUserAccount = (token) =>
  axios.delete(`${API}/delete-account`, getAuthHeaders(token));
