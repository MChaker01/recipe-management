import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./../components/Spinner";
import "../assets/styles/login.css";

const Login = () => {
  // 1. Déclare tes états (email, password, error, loading)
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { email, password } = formData;

  // 2. Récupère la fonction login depuis useAuth()
  const { login, isAuthenticated } = useAuth();

  // 3. Récupère navigate depuis useNavigate()
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  // Crée la fonction handleSubmit :
  const handleSubmit = async (e) => {
    // - Empêche le rechargement de la page
    e.preventDefault();
    // - Met loading à true
    setIsLoading(true);
    // - Try/catch : appelle login(email, password)
    try {
      await login(email, password);
      // - Si succès : navigate("/")
      navigate("/");
      setIsLoading(false);
    } catch (error) {
      // - Si erreur : setError(message d'erreur)
      // Récupérer le message d'erreur du backend
      const errorMessage =
        error.response?.data?.message || "Connection ERROR. Please try again.";
      setError(errorMessage);
      console.log("Error while login : ", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <main className="login-root">
      <section className="login-left" aria-hidden="true">
        <h1 className="brand">RecipeNest</h1>
        <p className="tagline">
          Keep your favorite recipes organized, seasoned, and always at hand.
        </p>
        <div className="decoration"></div>
      </section>

      <section className="login-form-section">
        <form className="login-form" method="post" onSubmit={handleSubmit}>
          <h2 className="form-title">Sign in to your kitchen</h2>

          <label className="input-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={onChange}
            />
          </label>

          <label className="input-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={onChange}
            />
          </label>

          <button type="submit" className="btn-login">
            Login
          </button>

          <p className="note">
            No account? <Link to="/register">Create one</Link>
          </p>
          {error && <div className="error-message">{error}</div>}
        </form>
      </section>
    </main>
  );
};

export default Login;
