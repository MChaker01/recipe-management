const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * @desc    Inscrire un nouvel utilisateur
 * @route   POST /api/users/register
 * @access  Public
 */

const registerUser = async (req, res) => {
  try {
    // 1. Récupérer les données du formulaire
    const { firstname, lastname, username, email, password } = req.body;

    // 2. Validation : vérifier que tous les champs sont remplis
    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    // 3. Vérifier si l'email ou le username existe déjà dans la BDD
    const emailExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username });

    if (emailExists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    if (usernameExists) {
      return res.status(409).json({ message: "username already exists" });
    }

    // 4. HACHAGE DU MOT DE PASSE (sécurité)
    // Étape 1 : Générer un "sel" (salt) - une chaîne aléatoire
    // Le nombre 10 = le "coût" du hachage (plus c'est élevé, plus c'est sécurisé mais lent)
    const passwordSalt = await bcrypt.genSalt(10);

    // Étape 2 : Hacher le mot de passe avec ce sel
    // Le hash résultant est une longue chaîne qui ne peut pas être "dé-hachée"
    const hashedPass = await bcrypt.hash(password, passwordSalt);

    // 5. Créer l'utilisateur dans MongoDB avec le mot de passe haché
    const newUser = await User.create({
      firstname,
      lastname,
      username,
      email,
      password: hashedPass,
    });

    // 6. Si la création a réussi, générer un token JWT
    if (newUser) {
      // jwt.sign() crée un token en 3 parties :
      // - Payload : les données qu'on veut encoder (ici l'ID de l'utilisateur)
      // - Secret : clé secrète pour signer le token (doit être gardée privée)
      // - Options : durée de validité, algorithme, etc.
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "3d",
      });

      // 7. Renvoyer les infos de l'utilisateur + le token au frontend
      res.status(201).json({
        _id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        username: newUser.username,
        email: newUser.email,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data." });
    }
  } catch (error) {
    console.error("Error creating user", error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

/**
 * @desc    Authentifier un utilisateur (connexion)
 * @route   POST /api/users/login
 * @access  Public
 */

const loginUser = async (req, res) => {
  try {
    // 1. Récupérer email et mot de passe du formulaire
    const { email, password } = req.body;

    // 2. Chercher l'utilisateur par email dans la BDD
    const user = await User.findOne({ email });

    // 3. Vérifier si l'utilisateur existe ET si le mot de passe est correct
    // bcrypt.compare() compare le mot de passe en clair avec le hash stocké
    if (user && (await bcrypt.compare(password, user.password))) {
      // 4. Connexion réussie : générer un nouveau token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // 5. Renvoyer les infos + token
      res.status(200).json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      // Si l'email n'existe pas OU le mot de passe est incorrect
      // On ne précise pas lequel pour des raisons de sécurité
      return res.status(401).json({ message: "Incorrect email or password." });
    }
  } catch (error) {
    console.error("Error while connecting : ", error);
    res.status(500).json({ message: "Server Error while connecting." });
  }
};

module.exports = { registerUser, loginUser };
