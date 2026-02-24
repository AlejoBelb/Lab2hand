// client/src/lib/api/auth.js

import { http } from './http';

// ============================
// Iniciar sesión
// ============================
export async function login({ email, password }) {
  const res = await http.post('/api/auth/login', { email, password });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible iniciar sesión');
  }

  const data = await res.json();

  // Guarda tokens en el cliente (http.js)
  http.setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return data.user;
}

// ============================
// Registrar usuario
// ============================
export async function register({ email, password, firstName, lastName, role }) {
  const res = await http.post('/api/auth/register', {
    email,
    password,
    firstName,
    lastName,
    role,
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible registrar el usuario');
  }

  const data = await res.json();
  return data.user;
}

// ============================
// Perfil del usuario autenticado
// ============================
export async function getMe() {
  const res = await http.get('/api/me');

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener el perfil');
  }

  const data = await res.json();
  return data.user;
}

// ============================
// Cerrar sesión
// ============================
export async function logout({ revokeServer = true } = {}) {
  const refreshToken = http.getRefreshToken();

  if (revokeServer && refreshToken) {
    try {
      await http.post('/api/auth/logout', { refreshToken });
    } catch {
      // Logout debe ser tolerante a errores
    }
  }

  http.clearTokens();
}

// ============================
// Refrescar tokens (manual)
// ============================
export async function refresh() {
  const refreshToken = http.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No hay refresh token');
  }

  const res = await http.post('/api/auth/refresh', { refreshToken });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible renovar la sesión');
  }

  const data = await res.json();

  http.setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return true;
}

// ============================
// Utilidad segura para JSON
// ============================
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
