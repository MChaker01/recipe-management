const express = require("express"); // Importation de base pour créer l'API

require("dotenv").config(); // Charge les variables d'environnement (comme DB_URI et PORT) depuis un fichier .env

const mongoose = require("mongoose"); // Outil pour interagir avec MongoDB (modélisation de données)

const cors = require("cors"); // Middleware pour gérer la politique de sécurité des requêtes HTTP (CORS)

const app = express(); // Création de l'instance de l'application Express

// --- Importer les routes ---
const recipeRoutes = require("./routes/recipeRoutes");
const userRoutes = require("./routes/userRoutes");

// MIDDLEWARES DE TRAITEMENT DES DONNÉES ENTRANTES (avant d'atteindre les routes)
app.use(express.json()); // Permet à Express de lire les corps de requêtes entrants en format JSON
app.use(express.urlencoded({ extended: true })); // Permet de gérer les données envoyées via les formulaires

// MIDDLEWARE DE SÉCURITÉ
app.use(cors()); // Autorise notre frontend (qui tourne sur un autre port/domaine) à communiquer avec cette API

// Servir les fichiers statiques (images uploadées)
// Cela rend le dossier "uploads" accessible publiquement
// cette ligne dit à Express : "Quand quelqu'un demande une URL qui commence par /uploads,
// cherche dans le dossier physique uploads/ et renvoie le fichier correspondant."
app.use("/uploads", express.static("uploads"));

// --- Définir les Routes ---
// Toutes les routes commençant par /api/recipes seront gérées par recipeRoutes
app.use("/api/recipes", recipeRoutes);
// Toutes les routes commençant par /api/users seront gérées par userRoutes
app.use("/api/users", userRoutes);

// CONNEXION À LA BASE DE DONNÉES
const DB_URI = process.env.DB_URI; // Récupère l'URI de connexion depuis les variables d'environnement

mongoose
  .connect(DB_URI) // Tente de se connecter à MongoDB
  // .then() : Exécuté si la connexion est réussie
  .then(() => {
    console.log("✅ Connected to MongoDB successfully.");

    // Démarrage du serveur Express
    // BONNE PRATIQUE : On ne démarre le serveur que si la connexion à la base de données a fonctionné.
    const PORT = process.env.PORT || 3000;
    app.listen(
      PORT, // Le port d'écoute
      () => {
        console.log(`🚀 Server successfully started on port ${PORT}`);
        console.log(`Local access : http://localhost:${PORT}`);
      }
    );
  })
  // .catch() : Exécuté si la connexion échoue
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Arrête le processus Node en cas d'échec critique
  });
