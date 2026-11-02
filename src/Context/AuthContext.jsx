import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios, { clearAuthentication, resetAuthLogoutState } from "../axios";

const AuthContext = createContext({
  user: null,
  loading: true,
  tokenCosts: { chat: null, description: null, image: null },
  login: () => {},
  logout: () => {},
  updateTokenBalance: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [tokenCosts, setTokenCosts] = useState({ chat: null, description: null, image: null });

  const logout = useCallback(() => {
    clearAuthentication();
    localStorage.removeItem("cart");
    setUser(null);
    setTokenCosts({ chat: null, description: null, image: null });
    setLoading(false);
  }, []);

  const login = useCallback(async (authResponse) => {
    resetAuthLogoutState();
    localStorage.setItem("jwt", authResponse.token);
    localStorage.setItem("user", JSON.stringify(authResponse.user));
    setUser(authResponse.user);
    try {
      const response = await axios.get("/tokens/costs");
      setTokenCosts(response.data);
    } catch (error) {
      console.error("Failed to load AI token costs:", error);
    }
  }, []);

  const updateTokenBalance = useCallback((balance) => {
    const tokenBalance = Number(balance);
    if (!Number.isFinite(tokenBalance)) return;

    setUser((currentUser) => {
      if (!currentUser || currentUser.admin) return currentUser;
      const updatedUser = { ...currentUser, tokenBalance };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
    };

    window.addEventListener("auth-logout", handleAuthLogout);
    return () => window.removeEventListener("auth-logout", handleAuthLogout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get("/me")
      .then((response) => {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
        return axios.get("/tokens/costs");
      })
      .then((response) => {
        if (response) setTokenCosts(response.data);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          logout();
        } else {
          console.error("Failed to initialize authenticated session:", error);
        }
      })
      .finally(() => setLoading(false));
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, tokenCosts, updateTokenBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
