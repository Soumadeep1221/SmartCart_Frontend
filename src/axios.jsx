import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

const clearAuthentication = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
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

    if (status === 401) {
      clearAuthentication();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    } else if (status === 403) {
      window.dispatchEvent(new CustomEvent("api-forbidden", {
        detail: "You are not allowed to perform this action.",
      }));
    }

    return Promise.reject(error);
  }
);

export const getProductImageUrl = (productId) =>
  `${API.defaults.baseURL}/product/${productId}/image`;

export { clearAuthentication };
export default API;
