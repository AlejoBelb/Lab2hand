// client/src/lib/api/http.js

// Base de la API tomada de variables de entorno públicas de Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Claves de almacenamiento local para tokens
const ACCESS_KEY = 'l2h_access_token';
const REFRESH_KEY = 'l2h_refresh_token';

// Obtiene el access token actual del almacenamiento
function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

// Obtiene el refresh token actual del almacenamiento
function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

// Guarda nuevos tokens en el almacenamiento
function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

// Limpia los tokens del almacenamiento
function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// Construye headers por defecto incluyendo Authorization si hay access token
function buildHeaders(extra = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extra
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Ejecuta una solicitud HTTP con manejo de 401 y auto-refresh
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const resp = await fetch(url, { ...options, headers: buildHeaders(options.headers || {}) });

  if (resp.status !== 401) {
    // Respuesta normal (no 401)
    return resp;
  }

  // Intento de auto-refresh si hay refresh token
  const refreshed = await tryRefresh();
  if (!refreshed) {
    clearTokens();
    return resp;
  }

  // Reintenta la solicitud original con el nuevo access token
  const retryResp = await fetch(url, { ...options, headers: buildHeaders(options.headers || {}) });
  return retryResp;
}

// Intenta renovar los tokens usando /api/auth/refresh
async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const r = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!r.ok) return false;

    const data = await r.json();
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

// Métodos de conveniencia para verbos comunes
async function get(path) {
  return request(path, { method: 'GET' });
}

async function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body || {}) });
}

async function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body || {}) });
}

async function del(path) {
  return request(path, { method: 'DELETE' });
}

// Exporta helpers principales
export const http = {
  get,
  post,
  patch,
  del,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  BASE_URL
};
