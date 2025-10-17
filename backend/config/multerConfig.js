const multer = require("multer");
const path = require("path"); // Module Node.js pour gérer les chemins de fichiers

/**
 ** CONFIGURATION DU STOCKAGE
 ** On dit à Multer OÙ et COMMENT sauvegarder les fichiers
 */

const storage = multer.diskStorage({
  // 1. Définir la DESTINATION (où sauvegarder)
  destination: function (req, file, cb) {
    // cb = callback
    // null = pas d'erreur
    // "uploads/recipes" = dossier de destination
    cb(null, "uploads/images");
  },

  // 2. Définir le NOM du fichier
  filename: function (req, file, cb) {
    // Générer un nom unique :
    // Date.now() = timestamp actuel
    // path.extname(file.originalname) = récupère l'extension (.jpg, .png, etc.)
    const nameWithoutExt = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const uniqueName =
      nameWithoutExt + "-" + Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

/**
 ** FILTRE : n'accepter QUE les images
 ** Sécurité : empêcher l'upload de fichiers dangereux (.exe, .js, etc.)
 */

const fileFilter = (req, file, cb) => {
  // Types MIME autorisés pour les images
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"), false);
  }
};

/**
 ** CONFIGURATION FINALE DE MULTER
 */

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
