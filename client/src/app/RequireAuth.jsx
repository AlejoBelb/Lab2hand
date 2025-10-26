// client/src/app/RequireAuth.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext.jsx';

// Componente de protección de rutas con validación opcional de roles.
// Uso: <RequireAuth roles={['ADMIN']}><MiPagina /></RequireAuth>
export default function RequireAuth({ children, roles }) {
  const { booting, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (booting) {
    return <div style={{ padding: 16 }}>Cargando sesión…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/demo-auth" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
