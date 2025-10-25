import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../assets/styles/recipes.css";
import { Link } from "react-router-dom";

const MyRecipes = () => {
  // 1. Déclare tes 3 états (recipes, error, isLoading)
  const [myRecipes, setMyRecipes] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Récupère le token depuis useAuth()
  const { token } = useAuth();

  // 3. useEffect pour appeler fetchRecipes au montage
  useEffect(() => {
    // 4. Crée une fonction fetchRecipes :
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError("");
      try {
        // envoyer le token dans les headers.
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await axios.get(
          "http://localhost:3000/api/recipes/my-recipes",
          config
        );

        setMyRecipes(response.data);
        setIsLoading(false);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Error Receiving Recipes.";
        setError(errorMessage);
        console.log("Error getting recipes. ", error);
      } finally {
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
      {/* 🥘 Recipes Grid */}
      <div className="recipe-grid-wrapper">
        <div className="recipe-grid">
          {myRecipes.map((myRecipe) => (
            <Link
              to={`/recipes/${myRecipe._id}`}
              style={{ textDecoration: "none" }}
              key={myRecipe._id}
            >
              <article className="recipe-card">
                <img
                  src={`http://localhost:3000${myRecipe.coverImage}`}
                  alt={myRecipe.title}
                />
                <div className="recipe-content">
                  <h3 className="recipe-title">{myRecipe.title}</h3>
                  <p className="recipe-desc">{myRecipe.description}</p>
                  <div className="recipe-meta">
                    <span>⏱️ {myRecipe.prepTime} min</span>
                    <span>🍽️ {myRecipe.servings} servings</span>
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

export default MyRecipes;
