import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { useNavigate, Link } from "react-router-dom";
import "../assets/styles/register.css";

const Register = () => {
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { register, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // 4. Destructure formData pour faciliter l'accès
  const { firstname, lastname, username, email, password, confirmPassword } =
    userData;

  const onChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        setError("Password don't match.");
        return;
      }
      await register({ firstname, lastname, username, email, password });
      setSuccess("User Created Successfully.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error creating account.", error);
      const errorMessage =
        error.response?.data?.message || "Error Error creating account.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <main className="auth-root">
      {/* Left Branding Section */}
      <section className="auth-left" aria-hidden="true">
        <h1 className="brand">RecipeNest</h1>
        <p className="tagline">
          Join our kitchen community — save your favorite recipes, experiment
          with new flavors, and create your own culinary story.
        </p>
        <div className="decoration"></div>
      </section>

      {/* Right Form Section */}
      <section className="auth-form-section">
        <form className="auth-form" method="post" onSubmit={handleSubmit}>
          <h2 className="form-title">Create your account</h2>

          <div className="name-fields">
            <label className="input-field">
              <span>First Name</span>
              <input
                type="text"
                name="firstname"
                value={firstname}
                required
                onChange={onChange}
              />
            </label>

            <label className="input-field">
              <span>Last Name</span>
              <input
                type="text"
                name="lastname"
                value={lastname}
                required
                onChange={onChange}
              />
            </label>
          </div>

          <label className="input-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              value={username}
              required
              onChange={onChange}
            />
          </label>

          <label className="input-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              required
              onChange={onChange}
            />
          </label>

          <label className="input-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={password}
              required
              onChange={onChange}
            />
          </label>

          <label className="input-field">
            <span>Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
            />
          </label>

          <button type="submit" className="btn btn-primary full-width">
            Sign Up
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <p className="note">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Register;
