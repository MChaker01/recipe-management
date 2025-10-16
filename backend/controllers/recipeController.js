const Recipe = require("../models/Recipe");

/**
 * @desc    Créer une recette
 * @route   POST /api/recipes
 * @access  Private (protégé par le middleware protect)
 */

const createRecipe = async (req, res) => {
  try {
    // 1. Récupérer les données du formulaire depuis req.body
    const {
      title,
      ingredients,
      description,
      coverImage,
      prepTime,
      servings,
      steps,
    } = req.body;

    // 2. Valider les champs obligatoires AVANT de contacter la BDD

    if (!title || !description || !prepTime || !servings) {
      return res.status(400).json({
        message:
          "title, description, image, preparation time and servings are required.",
      });
    }

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({
        message: "At least one ingredient is required.",
      });
    }

    if (!steps || steps.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one step is required." });
    }

    // 3. Créer la recette en associant l'utilisateur connecté
    // req.user.id vient du middleware 'protect' qui a décodé le token JWT

    const recipe = await Recipe.create({
      title,
      ingredients,
      description,
      coverImage,
      prepTime,
      servings,
      steps,
      user: req.user.id,
    });

    // 4. Renvoyer une réponse de succès avec le code 201 (Created)
    res
      .status(201)
      .json({ message: "Recipe created successffully.", Recipe: recipe });
  } catch (error) {
    console.error("Error creating recipe : ", error);
    res
      .status(500)
      .json({ message: "Error creating recipe : ", error: error.message });
  }
};

/**
 * @desc    Récupérer toutes les recette public.
 * @route   GET /api/recipes/
 * @access  public
 */
const getRecipes = async (req, res) => {
  try {
    let recipes;
    if (req.user) {
      recipes = await Recipe.find({
        $or: [{ isPublic: true }, { user: req.user.id }],
      });
    } else {
      recipes = await Recipe.find({ isPublic: true });
    }

    return res.status(200).json(recipes);
  } catch (error) {
    console.error("Error retrieving Recipes", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    Récupérer toutes les recette de l'utilisateur connecté
 * @route   GET /api/recipes/my-recipes
 * @access  Private
 */
const getMyRecipes = async (req, res) => {
  try {
    // Récupérer UNIQUEMENT les recettes qui appartiennent à l'utilisateur connecté
    // { user: req.user.id } = filtre MongoDB pour trouver les recettes de cet utilisateur
    const myRecipes = await Recipe.find({ user: req.user.id });

    res.status(200).json(myRecipes);
  } catch (error) {
    console.error("Error retrieving your Reciepes.", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Récupérer une seul recette par son ID
 * @route   GET /api/recipes/:id
 * @access  Public
 */
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (
      recipe &&
      (recipe.isPublic || recipe.user.toString() === req.user?.id)
    ) {
      res.json(recipe);
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    console.error("Error retrieving Recipe.", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Modifier une recette par son ID
 * @route   PUT /api/recipes/:id
 * @access  Private
 */

const updateRecipe = async (req, res) => {
  try {
    const recipeToUpdate = await Recipe.findById(req.params.id);

    if (!recipeToUpdate) {
      return res.status(404).json({ message: "Recipe Not found." });
    }

    if (recipeToUpdate.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 4. Mettre à jour la recette avec les nouvelles données de req.body
    // new: true → retourne le document APRÈS modification (pas l'ancien)
    // runValidators: true → applique les validations du schéma Mongoose
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res
      .status(200)
      .json({ message: "Recipe updated successfully.", Recipe: updatedRecipe });
  } catch (error) {
    console.error("Error while updating recipe.");
    return res.status(500).json({
      message: "Server Error while updating recipe",
      error: error.message,
    });
  }
};

/**
 * @desc    Supprimer une recette par son ID
 * @route   DELETE /api/recipes/:id
 * @access  Private
 */

const deleteRecipe = async (req, res) => {
  try {
    // 1. Trouver la recette que l'utilisateur veut supprimer
    const recipeToDelete = await Recipe.findById(req.params.id);

    // 2. Vérification d'existence
    if (!recipeToDelete) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // 3. Vérification de propriété
    if (recipeToDelete.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 4. Supprimer le document trouvé
    await recipeToDelete.deleteOne();

    // Renvoyer une confirmation de suppression
    return res
      .status(200)
      .json({ message: "Recipe deleted successfully.", id: req.params.id });
  } catch (error) {
    console.error("Error while deleting recipe.", error);
    res.status(500).json({
      message: "Server Error while deleting recipe.",
      error: error.message,
    });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getMyRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
};
