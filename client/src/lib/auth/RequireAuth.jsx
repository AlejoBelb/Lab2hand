// client/src/lib/auth/RequireAuth.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// Protege una ruta: requiere sesión activa.
// Si no hay sesión y se indica `redirectTo`, redirige allí (por defecto, a "/").
export function RequireAuth({ children, redirectTo = '/' }) {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  // Mientras se verifica sesión inicial (getMe), evita parpadeos
  if (booting) return null;

  if (!isAuthenticated) {
    // Puede ampliarse para recordar destino original en state
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}

// Protege por rol: requiere sesión + rol permitido.
// Uso: <RequireRole roles={['ADMIN']}>...</RequireRole>
export function RequireRole({ children, roles = [], redirectTo = '/' }) {
  const { user, isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return null;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
