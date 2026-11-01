import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios, { clearAuthentication } from "../axios";

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
  }, []);

  const login = useCallback((authResponse) => {
    localStorage.setItem("jwt", authResponse.token);
    localStorage.setItem("user", JSON.stringify(authResponse.user));
    setUser(authResponse.user);
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
    axios.get("/tokens/costs")
      .then((response) => setTokenCosts(response.data))
      .catch((error) => console.error("Failed to load token costs:", error));

    const token = localStorage.getItem("jwt");
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get("/me")
      .then((response) => {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
      })
      .catch(() => {
        logout();
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
