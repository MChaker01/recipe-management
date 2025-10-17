const express = require("express");
const {
  createRecipe,
  getRecipes,
  getMyRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
} = require("../controllers/recipeController");

const { protect } = require("../middlewares/authMiddleware");
const { optionalAuth } = require("../middlewares/optionalAuth");
const upload = require("../config/multerConfig");

const router = express.Router();

// Private routes :

// upload.single("coverImage") = middleware Multer
router.post("/", protect, upload.single("coverImage"), createRecipe);
router.get("/my-recipes", protect, getMyRecipes);
router.put("/:id", protect, upload.single("coverImage"), updateRecipe);
router.delete("/:id", protect, deleteRecipe);

// Public routes :
router.get("/search", optionalAuth, searchRecipes);
router.get("/", optionalAuth, getRecipes);
router.get("/:id", optionalAuth, getRecipeById);

module.exports = router;
