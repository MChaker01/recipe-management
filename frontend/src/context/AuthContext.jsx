import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// 1. Créer le Context
const AuthContext = createContext();

// 2. Créer le Provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const API_URL = "http://localhost:3000/api/users/";

  const login = async (email, password) => {
    // 1. Faire la requête POST vers /api/users/login
    // 2. Récupérer la réponse (user + token)
    const response = await axios.post(API_URL + "login", { email, password });

    if (response) {
      // 3. Stocker dans le state
      setUser(response.data);
      setToken(response.data.token);

      // 4. Stocker dans localStorage
      localStorage.setItem("user", JSON.stringify(response.data));
      // 5. Mettre isAuthenticated à true
      setIsAuthenticated(true);
    }
  };

  const register = async (userData) => {
    const response = await axios.post(API_URL + "register", userData);

    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // 1. Récupérer depuis localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      setToken(user.token);
      setIsAuthenticated(true);
    }
  }, []);

  const value = { isAuthenticated, user, token, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Créer le hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within a Provider.");
  }

  return context;
};
