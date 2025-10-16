const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 ** Middleware de protection des routes
 ** Ce middleware vérifie si l'utilisateur est authentifié avant d'accéder à une route protégée
 ** Il extrait le token JWT de l'en-tête Authorization, le vérifie, et attache l'utilisateur à req
 **/

const protect = async (req, res, next) => {
  let token;

  // 1. Vérifier si l'en-tête Authorization existe et commence par "Bearer"
  // Format attendu : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extraire le token en supprimant le préfixe "Bearer "
      // split(" ") divise la chaîne en tableau : ["Bearer", "le_token"]
      // [1] récupère le deuxième élément (le token)
      token = req.headers.authorization.split(" ")[1];

      // 3. Vérifier et décoder le token avec notre clé secrète
      // decoded contient le payload : { id: "user_id", iat: ..., exp: ... }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Récupérer l'utilisateur depuis MongoDB en utilisant l'ID du payload
      // .select("-password") exclut le mot de passe haché pour la sécurité
      // On attache l'utilisateur à req pour qu'il soit accessible dans les routes suivantes
      req.user = await User.findById(decoded.id).select("-password");

      // 5. Tout est OK, passer au middleware/route suivant
      // Le return arrête l'exécution de cette fonction
      return next();
    } catch (error) {
      console.error(error);

      // Si jwt.verify() échoue (token invalide, expiré, malformé)
      // On envoie une erreur 401 et on ARRÊTE l'exécution avec return
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
  }

  // 6. Si on arrive ici, c'est qu'il n'y a pas d'en-tête Authorization du tout
  // Pas besoin de vérifier "if (!token)" car si token existait, on serait déjà sorti de la fonction
  return res.status(401).json({ message: "Unauthorized, no token." });
};

module.exports = { protect };
