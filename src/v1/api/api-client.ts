import axios, { type InternalAxiosRequestConfig } from "axios";

const envBaseUrl = import.meta.env.VITE_API_URL_V1;
const baseURL = envBaseUrl?.trim() || "http://127.0.0.1:8000/api/v1";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
  interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  const skipAuth = config.skipAuth === true;

  if (!skipAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

if (typeof window !== "undefined") {
  // Debug visibility for API target in browser devtools.
  console.info("[api-client] baseURL:", baseURL);
}

export default apiClient;
