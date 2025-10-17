const Recipe = require("../models/Recipe");
const fs = require("fs");

/**
 * @desc    Créer une recette
 * @route   POST /api/recipes
 * @access  Private (protégé par le middleware protect)
 */

const createRecipe = async (req, res) => {
  try {
    // 1. Récupérer les données du formulaire depuis req.body
    let { title, ingredients, description, prepTime, servings, steps } =
      req.body;

    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }

    if (typeof steps === "string") {
      steps = JSON.parse(steps);
    }

    // 2. Valider les champs obligatoires AVANT de contacter la BDD

    if (!title || !description || !prepTime || !servings) {
      return res.status(400).json({
        message: "Required fields missing.",
      });
    }

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({
        message: "At least one ingredient required.",
      });
    }

    if (!steps || steps.length === 0) {
      return res.status(400).json({ message: "At least one step required." });
    }

    // 3. récupérer le chemin de l'image uploadée
    // Si un fichier a été uploadé, Multer l'a traité et mis dans req.file
    // On stocke le chemin relatif (pas absolu) pour plus de flexibilité
    let coverImage = null;
    if (req.file) {
      // On préfixe avec "/" pour créer une URL valide
      coverImage = "/" + req.file.path.replace(/\\/g, "/"); // Remplace \ par / (pour Windows)
    }

    // 4. Créer la recette en associant l'utilisateur connecté
    // req.user.id vient du middleware 'protect' qui a décodé le token JWT
    const recipe = await Recipe.create({
      title,
      ingredients,
      description,
      coverImage, // Le chemin vers l'image (ou null si pas d'image)
      prepTime,
      servings,
      steps,
      user: req.user.id,
    });

    // 5. Renvoyer une réponse de succès avec le code 201 (Created)
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

    // Parser les données si elles viennent en format string (form-data)
    let updateData = { ...req.body };

    if (typeof updateData.ingredients === "string") {
      updateData.ingredients = JSON.parse(updateData.ingredients);
    }

    if (typeof updateData.steps === "string") {
      updateData.steps = JSON.parse(updateData.steps);
    }

    // Gérer l'upload d'une nouvelle image
    // Si un fichier a été uploadé, on met à jour coverImage
    if (req.file) {
      if (recipeToUpdate.coverImage) {
        // récupérer l’ancien fichier à supprimer et enlèver le premier caractère du path (/).
        const filePath = recipeToUpdate.coverImage.slice(1);

        if (fs.existsSync(filePath)) {
          try {
            await fs.promises.unlink(filePath);
          } catch (error) {
            console.error("Error deleting old image", error);
          }
        }
      }

      updateData.coverImage = "/" + req.file.path.replace(/\\/g, "/");
    }

    // Sinon, on garde l'ancienne image (ou celle envoyée dans req.body)
    // Mettre à jour la recette avec les nouvelles données de req.body
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // new: true → retourne le document APRÈS modification (pas l'ancien)
        runValidators: true, // runValidators: true → applique les validations du schéma Mongoose
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

    // 4. Supprimer l'image si elle existe
    if (recipeToDelete.coverImage) {
      const filePath = recipeToDelete.coverImage.slice(1);
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath);
        } catch (error) {
          console.error("Error deleting image", error);
        }
      }
    }

    // 5. Supprimer le document trouvé
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

/**
 * @desc    Rechercher et filtrer des recettes
 * @route   GET /api/recipes/search
 * @access  Public
 */
const searchRecipes = async (req, res) => {
  try {
    // toujours appliqué.
    let visibilityFilter;
    // Si l'utilisateur a fait une recherche par titre.
    if (req.user) {
      visibilityFilter = { $or: [{ isPublic: true }, { user: req.user.id }] };
    } else {
      visibilityFilter = { isPublic: true };
    }

    // 2. Filtres additionnels (recherche, prepTime)
    let additionnalFilters = [];

    if (req.query.q) {
      additionnalFilters.push({
        $or: [
          { title: { $regex: req.query.q, $options: "i" } },
          { description: { $regex: req.query.q, $options: "i" } },
        ],
      });
    }

    // si l'utilisateur a fait un filter par perpTime
    if (req.query.prepTime) {
      additionnalFilters.push({
        prepTime: { $lte: Number(req.query.prepTime) },
      }); // $lte = Less Than or Equal
    }

    let finalFilter;

    if (additionnalFilters.length > 0) {
      finalFilter = {
        $and: [visibilityFilter, ...additionnalFilters],
      };
    } else {
      finalFilter = visibilityFilter;
    }

    const filtredRecipes = await Recipe.find(finalFilter);

    return res.status(200).json(filtredRecipes);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getMyRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
};
