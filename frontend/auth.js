// auth.js — Gestion complète de l’authentification (JWT)

const API_URL = "http://localhost:3000";

/* ================= TOKEN ================= */
function setToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function isAuthenticated() {
  return !!getToken();
}

/* ================= USER ================= */
function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "connexion.html";
}

/* ================= FETCH AUTH ================= */
async function authenticatedFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    logout();
    throw new Error("Non authentifié");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token,
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error("Session expirée");
  }

  return response;
}

/* ================= ROLE CHECK ================= */
function checkUserType(requiredType) {
  if (!isAuthenticated()) {
    alert("Veuillez vous connecter");
    window.location.href = "connexion.html";
    return false;
  }

  const user = getUser();

  if (!user || user.type !== requiredType) {
    alert(
      requiredType === "hote"
        ? "Accès réservé aux hôtes"
        : "Accès réservé aux clients"
    );
    window.location.href = "profil.html";
    return false;
  }

  return true;
}

/* ================= UI HELPERS ================= */
function showLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = `
      <div class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    `;
  }
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
}
