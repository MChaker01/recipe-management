import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/recipe-form.css";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    servings: "",
    isPublic: false,
  });
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState({
    name: "",
    quantity: "",
  });
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onRadioChange = (e) => {
    // Convertir la string "true"/"false" en boolean
    const booleanValue = e.target.value === "true";

    setFormData((prevState) => ({
      ...prevState,
      isPublic: booleanValue,
    }));
  };

  const onIngredientChange = (e) => {
    setCurrentIngredient((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const addIngredient = () => {
    setError("");
    if (!currentIngredient.name.trim() || !currentIngredient.quantity.trim()) {
      setError("name and quantity are required");
      return;
    }
    const newIngredients = [...ingredients, currentIngredient];

    setIngredients(newIngredients);

    setCurrentIngredient({ name: "", quantity: "" });
  };

  const removeIngredient = (indexToRemove) => {
    const remainingIngredients = ingredients.filter(
      (ingredient, index) => index !== indexToRemove
    );

    setIngredients(remainingIngredients);
  };

  const removeStep = (indexToRemove) => {
    const remainingSteps = steps.filter(
      (step, index) => index !== indexToRemove
    );

    setSteps(remainingSteps);
  };

  const addStep = () => {
    setError("");
    if (!currentStep) {
      setError("Step is required");
      return;
    }

    const newSteps = [...steps, currentStep];
    setSteps(newSteps);

    setCurrentStep("");
  };

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();

    if (ingredients.length <= 0) {
      setError("At least one ingredient required.");
      return;
    }

    if (steps.length <= 0) {
      setError("At least one step required.");
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.prepTime.trim() ||
      !formData.servings.trim()
    ) {
      setError("Required fields are empty.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Créer un objet FormData
      const dataToSend = new FormData();

      // 2. Ajouter tous les champs simples
      dataToSend.append("title", formData.title);
      dataToSend.append("description", formData.description);
      dataToSend.append("prepTime", Number(formData.prepTime));
      dataToSend.append("servings", Number(formData.servings));
      dataToSend.append("isPublic", formData.isPublic);

      // 3. Ajouter ingredients et steps (en JSON string)
      dataToSend.append("ingredients", JSON.stringify(ingredients));
      dataToSend.append("steps", JSON.stringify(steps));

      // 4. Ajouter l'image
      if (coverImage) {
        dataToSend.append("coverImage", coverImage);
      }

      // 5. Faire la requête POST avec axios
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        "http://localhost:3000/api/recipes/",
        dataToSend,
        config
      );

      // 6. Rediriger vers la page de la recette créée
      navigate(`/recipes/${response.data.Recipe._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Error creating recipe");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <main className="create-recipe-page">
      <h1 className="page-title">Create a New Recipe</h1>

      <form className="recipe-form" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Recipe Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            placeholder="Enter your recipe title"
            required
            onChange={onChange}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            rows="4"
            placeholder="Write a short description..."
            required
            onChange={onChange}
          ></textarea>
        </div>

        {/* Preparation Time */}
        <div className="form-group half">
          <label htmlFor="prepTime">Preparation Time (minutes)</label>
          <input
            type="number"
            id="prepTime"
            name="prepTime"
            value={formData.prepTime}
            min="1"
            placeholder="e.g. 30"
            required
            onChange={onChange}
          />
        </div>

        {/* Servings */}
        <div className="form-group half">
          <label htmlFor="servings">Servings</label>
          <input
            type="number"
            id="servings"
            name="servings"
            value={formData.servings}
            min="1"
            placeholder="e.g. 2"
            required
            onChange={onChange}
          />
        </div>

        {/* Visibility */}
        <div className="form-group visibility-group">
          <span className="label">Visibility</span>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="isPublic"
                value="true"
                checked={formData.isPublic === true}
                onChange={onRadioChange}
              />
              Public
            </label>
            <label>
              <input
                type="radio"
                name="isPublic"
                value="false"
                checked={formData.isPublic === false}
                onChange={onRadioChange}
              />
              Private
            </label>
          </div>
        </div>

        {/* 🧂 Ingredients Section */}
        <section className="form-section">
          <h2 className="section-title">Ingredients</h2>

          <div className="ingredient-inputs">
            <input
              type="text"
              name="name"
              placeholder="Ingredient name"
              value={currentIngredient.name}
              onChange={onIngredientChange}
            />
            <input
              type="text"
              name="quantity"
              placeholder="Quantity"
              value={currentIngredient.quantity}
              onChange={onIngredientChange}
            />
            <button
              type="button"
              className="btn btn-secondary add-btn"
              onClick={addIngredient}
            >
              + Add
            </button>
          </div>

          {ingredients.length > 0 && (
            <ul className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  <div className="ingredient-content">
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className="ingredient-qty">
                      {ingredient.quantity}
                    </span>
                  </div>
                  <button type="button" onClick={() => removeIngredient(index)}>
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 🧾 Steps Section */}
        <section className="form-section">
          <h2 className="section-title">Steps</h2>

          <div className="step-inputs">
            <textarea
              name="step"
              placeholder="Write a step..."
              rows="2"
              value={currentStep}
              onChange={(e) => setCurrentStep(e.target.value)}
            ></textarea>
            <button
              type="button"
              className="btn btn-secondary add-btn"
              onClick={addStep}
            >
              + Add Step
            </button>
          </div>

          {steps.length > 0 && (
            <ol className="steps-list">
              {steps.map((step, index) => (
                <li key={index} className="step-item">
                  <div className="step-content">{step}</div>
                  <button type="button" onClick={() => removeStep(index)}>
                    &times;
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* 🖼️ Cover Image Upload */}
        <section className="form-section">
          <h2 className="section-title">Cover Image</h2>

          <div className="image-upload-bar">
            <label htmlFor="coverImage" className="choose-btn">
              Choose Image
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                accept="image/*"
                onChange={(e) => {
                  setCoverImage(e.target.files[0]);
                }}
              />
            </label>

            <div className="file-info">
              {coverImage ? (
                <span className="file-name">{coverImage.name}</span>
              ) : (
                <span className="placeholder">No file chosen</span>
              )}
            </div>
          </div>

          {coverImage && (
            <div className="preview">
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Preview"
                className="preview-img"
              />
            </div>
          )}
        </section>

        {error && <div className="error-message">{error}</div>}

        {/* Submit */}
        <button type="submit" className="btn btn-primary submit-btn">
          Save Recipe
        </button>
      </form>
    </main>
  );
};

export default AddRecipe;
