const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
    },
    ingredients: [
      {
        name: {
          type: String,
          required: [true, "ingredients are required"],
          trim: true,
        },
        quantity: {
          type: String,
          required: [true, "quantity is required"],
        },
      },
    ],
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    coverImage: {
      type: String,
    },
    prepTime: {
      type: Number,
      required: [true, "preparation time is required"],
    },
    servings: {
      type: Number,
      required: [true, "servings are required"],
    },
    steps: [
      {
        type: String,
        required: [true, "steps is required"],
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
