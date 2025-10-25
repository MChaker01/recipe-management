import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/recipe-details.css";
import Spinner from "./../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const RecipeDetails = () => {
  // 1. Récupérer l'ID depuis l'URL
  const { id } = useParams();

  const navigate = useNavigate();

  // 2. Créer le state pour stocker la recette
  const [recipe, setRecipe] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token, user, isLoading: authLoading } = useAuth();

  // recipe.user c'est l'id du créateur de la recette
  // user._id c'est l'id de l'utilisateur connecté disponible via useAuth()
  const isOwner = user && recipe && recipe.user.toString() === user._id;

  // 3. useEffect pour fetch les données
  useEffect(() => {
    if (authLoading) {
      return;
    }

    const getRecipe = async () => {
      setIsLoading(true);
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get(
          `http://localhost:3000/api/recipes/${id}`,
          config
        );

        setRecipe(response.data);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Unable to load recipe. Please try again later.";
        console.log("Unable to load recipe. Please try again later.", error);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    getRecipe();
  }, [id, token, authLoading]);

  const handleDelete = async () => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      if (confirm("Are you sure you want to delete?")) {
        const response = await axios.delete(
          `http://localhost:3000/api/recipes/${id}`,
          config
        );

        if (response) {
          navigate("/my-recipes");
        }
      }
    } catch (error) {
      setError("Error while deleting recipe.");
      console.error("Error while deleting recipe : ", error);
    }
  };

  if (authLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (isLoading || !recipe) {
    return <Spinner />;
  }

  return (
    <main className="recipe-details">
      {/* Cover Image */}
      <header className="recipe-header">
        <div className="recipe-cover-container">
          <img
            src={`http://localhost:3000${recipe.coverImage}`}
            alt={recipe.title}
            className="recipe-cover"
          />
        </div>

        <div className="recipe-header-content">
          <h1 className="recipe-title">{recipe.title}</h1>

          <p className="recipe-meta">
            <span>⏱️ {recipe.prepTime} min</span>
            <span>🍽️ {recipe.servings} servings</span>
            <span className="status-tag">
              {recipe.isPublic ? "Public Recipe" : "Private Recipe"}
            </span>
          </p>

          <p className="recipe-desc">{recipe.description}</p>

          {isOwner && (
            <div className="recipe-actions">
              <Link
                to={`/edit-recipe/${recipe._id}`}
                style={{ textDecoration: "none" }}
                className="btn btn-secondary"
              >
                ✏️ Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Ingredients */}
      <section className="recipe-section">
        <h2 className="section-title">Ingredients</h2>
        <ul className="ingredients-list">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>
              <span>{ingredient.name}</span>
              <span>{ingredient.quantity}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="recipe-section">
        <h2 className="section-title">Steps</h2>
        <ol className="steps-list">
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
};

export default RecipeDetails;
