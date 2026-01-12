# Tigminoo 🏠✨

**Tigminoo** est une application web moderne dédiée à la gestion de locations de logements de courte durée. Développé dans le cadre de la filière **ASEDS (Advanced Software Engineering for Digital Services)** à l'**INPT (Institut National des Postes et Télécommunications)**, ce projet offre une plateforme centralisée connectant les propriétaires (hôtes) et les voyageurs, avec une expérience utilisateur fluide et sécurisée.

## 🌟 Fonctionnalités Principales

* **Catalogue Dynamique :** Consultation des logements avec filtrage avancé par ville, type et prix, alimenté par une base de données **MySQL**.


* **Système d'Authentification Sécurisé :** Gestion des connexions et inscriptions pour Clients et Hôtes via **JWT (JSON Web Tokens)** et hachage des mots de passe avec **Bcrypt**.


* **Réservation Intelligente :** Vérification automatique des disponibilités pour éviter les conflits de dates avant confirmation.


* **Paiement Simulé :** Module de simulation de transaction pour valider le cycle complet d'une réservation.


* **Gestion des Avis :** Système permettant aux clients de noter et commenter les logements après leur séjour pour renforcer la confiance.


* **Tableaux de Bord Rôle-Spécifique :** Interfaces distinctes pour les **Hôtes** (ajout de logements, suivi des réservations) et les **Clients** (historique, annulations).



## 🛠️ Stack Technique

**Frontend :**

* HTML5 & CSS3 (Design responsive) 


* **Bootstrap** (Framework CSS) 


* Vanilla JavaScript & **Fetch API** (Communication asynchrone) 



**Backend :**

* **Node.js** (Environnement d'exécution) 


* **Express.js** (Framework serveur) 


* **JWT** & **Bcrypt** (Sécurité) 


* **Dotenv** (Variables d'environnement) 



**Base de Données :**

* **MySQL** (SGBDR) 


* Bibliothèque **mysql2** 



## 🚀 Installation & Configuration

1. **Cloner le dépôt :**
```bash
git clone https://github.com/mustapha-ben-mouss/tigminoo.git
cd tigminoo

```


2. **Installer les dépendances :**
```bash
npm install

```


3. **Configuration de la Base de Données :**
* Créez une base de données MySQL nommée `tigminoo_db`.
* Importez le fichier SQL fourni (contenant les tables `client`, `hote`, `logement`, `reservation`, `avis`).




4. **Variables d'Environnement :**
Créez un fichier `.env` à la racine du projet et collez la configuration suivante:


```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=user
DB_NAME=tigminoo
JWT_SECRET=00000001
PORT=3000

```


5. **Lancer l'application :**
```bash
# Lancer le serveur avec Node
node server.js

```


*Accédez à l'application via : `http://localhost:3000*`

## 🔐 Comptes de Test (Mode Démo)

Utilisez ces identifiants (basés sur les données du rapport) pour tester les différents rôles de l'application :

**Compte Client (Locataire) :**

* 
**Email :** `benmoussamustafa94@gmail.com` 


* 
**Mot de passe :** `12344321` 



**Compte Hôte (Propriétaire) :**

* 
**Email :** `benmoussaelhafid94@gmail.com` 


* 
**Mot de passe :** `13131313` 



---

**Réalisé par Mustapha BEN MOUSSA** *Étudiant en Ingénierie Logicielle (Filière ASEDS) - INPT Rabat*
