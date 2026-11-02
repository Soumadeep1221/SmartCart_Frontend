import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL || "http://localhost:8080"}/api`,
});

const AUTH_STORAGE_KEYS = ["jwt", "user"];

const clearAuthentication = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

const getTokenPayload = () => {
  const token = localStorage.getItem("jwt");
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;

    const payload = parts[1];
    const padding = "=".repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedPayload + padding);
  } catch {
    return null;
  }
};

export const isTokenValid = () => {
  const { exp } = getTokenPayload() || {};
  return Number.isFinite(exp) && exp * 1000 > Date.now();
};

export const getTokenExpiration = () => {
  const { exp } = getTokenPayload() || {};
  return Number.isFinite(exp) ? exp * 1000 : null;
};

let isLoggingOut = false;
let lastForbiddenNotification = 0;

export const logout = () => {
  clearAuthentication();

  if (!isLoggingOut) {
    isLoggingOut = true;
    window.dispatchEvent(new CustomEvent("auth-logout"));

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
};

export const resetAuthLogoutState = () => {
  isLoggingOut = false;
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl === "/auth/google" || requestUrl.endsWith("/auth/google");
    if (status === 401 && !isLoginRequest) {
      logout();
    } else if (status === 403) {
      const now = Date.now();
      if (now - lastForbiddenNotification > 1000) {
        lastForbiddenNotification = now;
        window.dispatchEvent(new CustomEvent("api-forbidden", {
          detail: "You are not allowed to perform this action.",
        }));
      }
    }

    return Promise.reject(error);
  }
);

export const getProductImageUrl = (productId) =>
  `${API.defaults.baseURL}/product/${productId}/image`;

export { clearAuthentication };
export default API;
