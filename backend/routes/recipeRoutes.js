const express = require("express");
const {
  createRecipe,
  getRecipes,
  getMyRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const { protect } = require("../middlewares/authMiddleware");
const { optionalAuth } = require("../middlewares/optionalAuth");

const router = express.Router();

// Private routes :
router.post("/", protect, createRecipe);
router.get("/my-recipes", protect, getMyRecipes);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);

// Public routes :
router.get("/", optionalAuth, getRecipes);
router.get("/:id", optionalAuth, getRecipeById);

module.exports = router;
