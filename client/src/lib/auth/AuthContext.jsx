// client/src/lib/auth/AuthContext.jsx

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout, getMe as apiGetMe } from '../api/auth';
import { http } from '../api/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Arranque: si hay tokens en localStorage, intenta obtener el perfil
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = http.getAccessToken();
        if (!token) {
          setBooting(false);
          return;
        }
        const me = await apiGetMe();
        if (mounted) setUser(me);
      } catch {
        // Si falla, se limpian tokens inválidos
        http.clearTokens();
      } finally {
        if (mounted) setBooting(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function login({ email, password }) {
    setAuthError(null);
    try {
      const me = await apiLogin({ email, password });
      setUser(me);
      return me;
    } catch (e) {
      setAuthError(e.message || 'No fue posible iniciar sesión');
      throw e;
    }
  }

  async function logout() {
    try {
      await apiLogout({ revokeServer: true });
    } finally {
      http.clearTokens();
      setUser(null);
    }
  }

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    booting,
    authError,
    login,
    logout,
    refreshTokens: async () => {
      // Forzado: útil si quieres renovar manualmente
      const ok = await (async () => {
        const refreshToken = http.getRefreshToken();
        if (!refreshToken) return false;
        try {
          const res = await fetch(`${http.BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          if (!res.ok) return false;
          const data = await res.json();
          http.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          return true;
        } catch {
          return false;
        }
      })();
      return ok;
    }
  }), [user, booting, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
