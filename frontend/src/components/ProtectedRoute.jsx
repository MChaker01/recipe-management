import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  // 1. Récupérer isAuthenticated depuis useAuth()
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  // 2. Si non connecté, retourner <Navigate to="/login" />
  // 3. Sinon, retourner {children}
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
