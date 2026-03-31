import axios from "axios";

const API = "http://localhost:5000/api/messages";

const getToken = () => {
  // Try all possible token storage keys
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  if (!token) {
    console.error("❌ No token found in localStorage!");
  } else {
    console.log("✅ Token found:", token.substring(0, 20) + "...");
  }
  return token;
};

// Get all users to chat with (GET /api/messages/users)
export const getUsers = (token) => {
  const t = token || getToken();
  console.log("📡 Fetching users with token:", t ? "present" : "MISSING");
  return axios.get(`${API}/users`, {
    headers: { Authorization: `Bearer ${t}` },
  });
};

// Get messages between current user and userId
export const getMessages = (userId, token) => {
  const t = token || getToken();
  return axios.get(`${API}/${userId}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
};

// Send a message
export const sendMessage = (data, token) => {
  const t = token || getToken();
  return axios.post(API, data, {
    headers: { Authorization: `Bearer ${t}` },
  });
};