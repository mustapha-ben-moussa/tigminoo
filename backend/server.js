require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= MYSQL ================= */
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "user",
  database: process.env.DB_NAME || "tigminoo",
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error("❌ Erreur MySQL :", err);
    process.exit(1);
  } else {
    console.log("✅ Connecté à MySQL");
  }
});

/* ================= JWT SECRET ================= */
const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_super_securise_a_changer";

/* ================= MIDDLEWARE AUTH ================= */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }
    req.user = user;
    next();
  });
};

/* ================= VALIDATION ================= */
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

/* ================= INSCRIPTION ================= */

// CLIENT
app.post("/register/client", async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password } = req.body;

    // Validation
    if (!nom || !prenom || !email || !telephone || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO client (nom, prenom, email, telephone, password) VALUES (?, ?, ?, ?, ?)",
      [nom, prenom, email, telephone, hash],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Email déjà utilisé" });
          }
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.status(201).json({ message: "Inscription client réussie ✅" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// HÔTE
app.post("/register/hote", async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password } = req.body;

    // Validation
    if (!nom || !prenom || !email || !telephone || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO hote (nom, prenom, email, telephone, password) VALUES (?, ?, ?, ?, ?)",
      [nom, prenom, email, telephone, hash],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Email déjà utilisé" });
          }
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.status(201).json({ message: "Inscription hôte réussie ✅" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ================= CONNEXION ================= */
/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
  const { email, password, type } = req.body;

  if (!email || !password || !type) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  const table = type === "client" ? "client" : "hote";

  db.query(
    `SELECT * FROM ${table} WHERE email = ?`,
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        {
          id: user.id_client || user.id_hote,
          type: type
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Connexion réussie ✅",
        token,
        user: {
          id: user.id_client || user.id_hote,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          type
        }
      });
    }
  );
});


app.get("/logements", (req, res) => {
  try {
    const { ville, type, prixMax } = req.query;

    console.log("Filtres reçus:", { ville, type, prixMax });

    // ✅ DÉCLARATION OBLIGATOIRE
    let sql = "SELECT * FROM logement WHERE 1=1";
    const params = [];

    if (ville && ville.trim() !== '') {
      sql += " AND LOWER(ville) = LOWER(?)";
      params.push(ville.trim());
    }

    if (type && type.trim() !== '') {
      sql += " AND type_logement = ?";
      params.push(type.trim());
    }

    if (prixMax && !isNaN(prixMax)) {
      sql += " AND prix_par_nuit <= ?";
      params.push(parseFloat(prixMax));
    }

    console.log("SQL:", sql, params);

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Erreur SQL:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.json(results);
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// DÉTAIL D'UN LOGEMENT
app.get("/logements/:id", (req, res) => {
  try {
    db.query(
      "SELECT * FROM logement WHERE id_logement = ?",
      [req.params.id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "Logement introuvable" });
        }
        res.json(results[0]);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// LOGEMENTS D'UN HÔTE
app.get("/logements/hote/:id", authenticateToken, (req, res) => {
  try {
    // Vérifier que l'utilisateur accède à ses propres logements
    if (req.user.type !== 'hote' || req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    db.query(
      "SELECT * FROM logement WHERE id_hote = ?",
      [req.params.id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// AJOUT LOGEMENT
app.post("/logements", authenticateToken, (req, res) => {
  try {
    // Vérifier que c'est bien un hôte
    if (req.user.type !== 'hote') {
      return res.status(403).json({ message: "Accès réservé aux hôtes" });
    }

    const { titre, adresse, ville, type_logement, prix_par_nuit } = req.body;

    // Validation
    if (!titre || !adresse || !ville || !type_logement || !prix_par_nuit) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (prix_par_nuit <= 0) {
      return res.status(400).json({ message: "Prix invalide" });
    }

    // Utiliser l'ID du token JWT, pas celui envoyé par le client
    const id_hote = req.user.id;

    db.query(
      "INSERT INTO logement (titre, adresse, ville, type_logement, prix_par_nuit, id_hote) VALUES (?, ?, ?, ?, ?, ?)",
      [titre, adresse, ville, type_logement, prix_par_nuit, id_hote],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.status(201).json({ message: "Logement ajouté ✅" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ================= RÉSERVATIONS ================= */

// RÉSERVER AVEC BLOCAGE DES DATES
app.post("/reservations", authenticateToken, (req, res) => {
  try {
    // Vérifier que c'est bien un client
    if (req.user.type !== 'client') {
      return res.status(403).json({ message: "Accès réservé aux clients" });
    }

    const { date_debut, date_fin, id_logement } = req.body;
    const id_client = req.user.id; // ID du token JWT

    // Validation
    if (!date_debut || !date_fin || !id_logement) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (new Date(date_debut) >= new Date(date_fin)) {
      return res.status(400).json({ message: "Dates invalides" });
    }

    const checkSql = `
      SELECT * FROM reservation
      WHERE id_logement = ?
      AND statut != 'annulee'
      AND (
        (? BETWEEN date_debut AND date_fin)
        OR (? BETWEEN date_debut AND date_fin)
        OR (date_debut BETWEEN ? AND ?)
      )
    `;

    db.query(
      checkSql,
      [id_logement, date_debut, date_fin, date_debut, date_fin],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "Dates non disponibles ❌" });
        }

        db.query(
          "INSERT INTO reservation (date_debut, date_fin, id_client, id_logement) VALUES (?, ?, ?, ?)",
          [date_debut, date_fin, id_client, id_logement],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Erreur serveur" });
            }
            res.status(201).json({ message: "Réservation créée (en attente) ✅" });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// RÉSERVATIONS D'UN CLIENT
app.get("/reservations/client/:id", authenticateToken, (req, res) => {
  try {
    // Vérifier que le client accède à ses propres réservations
    if (req.user.type !== 'client' || req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    db.query(
      `SELECT r.*, l.titre
       FROM reservation r
       JOIN logement l ON r.id_logement = l.id_logement
       WHERE r.id_client = ?`,
      [req.params.id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DATES RÉSERVÉES D'UN LOGEMENT
app.get("/reservations/logement/:id", (req, res) => {
  try {
    db.query(
      "SELECT date_debut, date_fin FROM reservation WHERE id_logement = ? AND statut != 'annulee'",
      [req.params.id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ANNULER UNE RÉSERVATION
app.put("/reservations/:id/annuler", authenticateToken, (req, res) => {
  try {
    if (req.user.type !== 'client') {
      return res.status(403).json({ message: "Accès réservé aux clients" });
    }

    // Vérifier que la réservation appartient au client
    db.query(
      "SELECT * FROM reservation WHERE id_reservation = ? AND id_client = ?",
      [req.params.id, req.user.id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Réservation introuvable" });
        }

        db.query(
          "UPDATE reservation SET statut = 'annulee' WHERE id_reservation = ?",
          [req.params.id],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Erreur serveur" });
            }
            res.json({ message: "Réservation annulée ✅" });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ================= PAIEMENT ================= */

// EFFECTUER UN PAIEMENT
app.post("/paiements", authenticateToken, (req, res) => {
  const { id_reservation } = req.body;

  if (!id_reservation) {
    return res.status(400).json({ message: "ID réservation manquant" });
  }

  // 1️⃣ Vérifier le statut actuel
  db.query(
    "SELECT statut FROM reservation WHERE id_reservation = ?",
    [id_reservation],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Réservation introuvable" });
      }

      if (results[0].statut === "confirmee") {
        return res.json({ message: "Réservation déjà confirmée ✅" });
      }

      // 2️⃣ Confirmer la réservation
      db.query(
        "UPDATE reservation SET statut = 'confirmee' WHERE id_reservation = ?",
        [id_reservation],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur" });
          }

          res.json({ message: "Réservation validée avec succès 🎉" });
        }
      );
    }
  );
});



/* ================= AVIS ================= */

// AJOUTER UN AVIS
app.post("/avis", authenticateToken, (req, res) => {
  try {
    if (req.user.type !== 'client') {
      return res.status(403).json({ message: "Accès réservé aux clients" });
    }

    const { note, commentaire, id_logement } = req.body;
    const id_client = req.user.id;

    // Validation
    if (!note || !commentaire || !id_logement) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({ message: "Note invalide (1-5)" });
    }

    // Vérifier réservation confirmée
    const checkSql = `
      SELECT * FROM reservation
      WHERE id_client = ?
      AND id_logement = ?
      AND statut = 'confirmee'
    `;

    db.query(checkSql, [id_client, id_logement], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(403).json({
          message: "Vous devez avoir une réservation confirmée ❌"
        });
      }

      db.query(
        "INSERT INTO avis (note, commentaire, id_client, id_logement) VALUES (?, ?, ?, ?)",
        [note, commentaire, id_client, id_logement],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur" });
          }
          res.status(201).json({ message: "Avis ajouté ✅" });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// AVIS D'UN LOGEMENT
app.get("/avis/logement/:id", (req, res) => {
  try {
    db.query(
      `SELECT a.*, c.nom, c.prenom
       FROM avis a
       JOIN client c ON a.id_client = c.id_client
       WHERE a.id_logement = ?
       ORDER BY a.date_avis DESC`,
      [req.params.id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ================= SERVEUR ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});