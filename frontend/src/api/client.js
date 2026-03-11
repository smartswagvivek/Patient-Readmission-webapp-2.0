import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
export const TOKEN_STORAGE_KEY = "hospital_ai_token";
export const USER_STORAGE_KEY = "hospital_ai_user";

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginStaff(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

export async function registerStaff(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await apiClient.get("/auth/me");
  return response.data?.user;
}

export async function predictReadmission(payload) {
  const response = await apiClient.post("/predict", payload);
  return response.data;
}

export async function fetchPredictionHistory(limit = 200) {
  const response = await apiClient.get("/predictions/history", {
    params: { limit },
  });
  return response.data?.items || [];
}

export async function fetchPredictionDetail(predictionId) {
  const response = await apiClient.get(`/predictions/${predictionId}`);
  return response.data;
}

