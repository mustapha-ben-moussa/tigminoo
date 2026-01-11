const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "user",
  database: "tigminoo",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur connexion MySQL :", err.message);
  } else {
    console.log("✅ Connecté à la base de données tigminoo");
  }
});

module.exports = db;
