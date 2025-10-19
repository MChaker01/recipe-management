import React, { useState } from "react";
import "../assets/styles/navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // 1. Récupère isAuthenticated et logout depuis useAuth()
  const { isAuthenticated, logout } = useAuth();

  // 2. Récupère navigate depuis useNavigate()
  const navigate = useNavigate();

  // 3. Crée la fonction handleLogout :
  const handleLogout = () => {
    // Appelle logout()
    logout();
    // Navigate vers "/login"
    navigate("/login");
  };
  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          RecipeNest
        </Link>
      </div>

      <nav className={`navbar-links ${isOpen ? "open" : ""}`}>
        {isAuthenticated ? (
          <>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/my-recipes">My Recipes</NavLink>
            <NavLink to="/add-recipe">Add Recipe</NavLink>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>

      {/* Optional: mobile menu icon placeholder */}
      <button
        className={`navbar-toggle ${isOpen ? "active" : ""}`}
        aria-label="Toggle menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
};

export default Navbar;
