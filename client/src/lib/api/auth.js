// client/src/lib/api/auth.js

import { http } from './http';

// Inicia sesión: guarda tokens y devuelve el perfil
export async function login({ email, password }) {
  const res = await http.post('/api/auth/login', { email, password });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible iniciar sesión');
  }
  const data = await res.json();
  http.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
}

// Registra un usuario (ADMIN puede crear otros usuarios si el backend lo permite)
export async function register({ email, password, firstName, lastName, role }) {
  const res = await http.post('/api/auth/register', { email, password, firstName, lastName, role });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible registrar el usuario');
  }
  const data = await res.json();
  return data.user;
}

// Obtiene el perfil del usuario autenticado
export async function getMe() {
  const res = await http.get('/api/me');
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener el perfil');
  }
  const data = await res.json();
  return data.user;
}

// Cierra sesión en el cliente y opcionalmente en el servidor si hay refresh token
export async function logout({ revokeServer = true } = {}) {
  const refreshToken = http.getRefreshToken();

  if (revokeServer && refreshToken) {
    try {
      await http.post('/api/auth/logout', { refreshToken });
    } catch {
      // Ignorar errores de red/revocación en logout
    }
  }

  http.clearTokens();
}

// Intenta refrescar tokens manualmente (por si quieres forzarlo desde la UI)
export async function refresh() {
  const refreshToken = http.getRefreshToken();
  if (!refreshToken) throw new Error('No hay refresh token');

  const res = await fetch(`${http.BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible renovar la sesión');
  }

  const data = await res.json();
  http.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return true;
}

// Utilidad: intenta parsear JSON; si falla, retorna null
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
