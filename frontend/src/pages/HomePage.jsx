import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../assets/styles/recipes.css";
import { Link } from "react-router-dom";

const HomePage = () => {
  // 1. Déclare tes 3 états (recipes, error, isLoading)
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Récupère le token depuis useAuth()
  const { token } = useAuth();

  // 4. useEffect pour appeler fetchRecipes au montage
  useEffect(() => {
    // 3. Crée une fonction fetchRecipes :
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        // Si token existe envoyer le dans les headers.
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const response = await axios.get(
          "http://localhost:3000/api/recipes/",
          config
        );

        setRecipes(response.data);
        setIsLoading(false);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Error Recieving Recipes.";
        setError(errorMessage);
        console.log("Error getting recipes. ", error);
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [token]);

  if (isLoading) {
    return <Spinner />;
  }

  return error ? (
    <div className="error-message">{error}</div>
  ) : (
    <section className="recipe-list-section">
      {/* 🔍 Search + Filter Bar */}
      <div className="recipe-controls">
        <div className="recipe-search">
          <input
            type="text"
            placeholder="Search recipes..."
            className="search-input"
          />
        </div>

        <div className="recipe-filter">
          <label htmlFor="prepTime">Filter by Prep Time:</label>
          <select id="prepTime" className="filter-select">
            <option value="">All</option>
            <option value="15">Under 15 minutes</option>
            <option value="30">Under 30 minutes</option>
            <option value="60">Under 1 hour</option>
            <option value="120">Over 1 hour</option>
          </select>
        </div>

        <button className="btn btn-secondary">Apply</button>
      </div>

      {/* 🥘 Recipes Grid */}
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <article className="recipe-card" key={recipe._id}>
            <img
              src={`http://localhost:3000${recipe.coverImage}`}
              alt={recipe.title}
            />
            <div className="recipe-content">
              <h3 className="recipe-title">{recipe.title}</h3>
              <p className="recipe-desc">{recipe.description}</p>
              <div className="recipe-meta">
                <span>⏱️ {recipe.prepTime} min</span>
                <span>🍽️ {recipe.servings} servings</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HomePage;
