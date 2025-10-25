import React, { useState, useEffect, useCallback } from "react";
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
  const [filters, setFilters] = useState({ q: "", prepTime: "" });

  // 2. Récupère le token depuis useAuth()
  const { token } = useAuth();

  // 3. Crée une fonction fetchRecipes :
  const fetchRecipes = useCallback(
    async (searchFilters = {}) => {
      setIsLoading(true);
      setError("");
      try {
        // Si token existe envoyer le dans les headers.
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const params = new URLSearchParams();
        if (searchFilters.q) params.append("q", searchFilters.q);
        if (searchFilters.prepTime)
          params.append("prepTime", searchFilters.prepTime);

        const url = params.toString()
          ? `http://localhost:3000/api/recipes/search?${params.toString()}`
          : "http://localhost:3000/api/recipes/";

        const response = await axios.get(url, config);

        setRecipes(response.data);
        setIsLoading(false);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Error Receiving Recipes.";
        setError(errorMessage);
        console.log("Error getting recipes. ", error);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // 4. useEffect pour appeler fetchRecipes au montage
  useEffect(() => {
    fetchRecipes();
  }, [token, fetchRecipes]);

  const onFilterChange = (e) => {
    setFilters((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

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
            name="q"
            value={filters.q}
            onChange={onFilterChange}
          />
        </div>

        <div className="recipe-filter">
          <label htmlFor="prepTime">Filter by Prep Time:</label>
          <select
            id="prepTime"
            name="prepTime"
            className="filter-select"
            value={filters.prepTime}
            onChange={onFilterChange}
          >
            <option value="">All</option>
            <option value="15">Under 15 minutes</option>
            <option value="30">Under 30 minutes</option>
            <option value="60">Under 1 hour</option>
          </select>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => fetchRecipes(filters)}
        >
          Apply
        </button>
      </div>

      {/* 🥘 Recipes Grid */}
      <div className="recipe-grid-wrapper">
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <Link
              to={`/recipes/${recipe._id}`}
              style={{ textDecoration: "none" }}
              key={recipe._id}
            >
              <article className="recipe-card">
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePage;
