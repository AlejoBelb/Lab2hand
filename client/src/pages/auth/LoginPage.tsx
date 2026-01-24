// client/src/pages/auth/LoginPage.tsx
// Página de inicio de sesión con formulario controlado y redirección a Home al autenticar.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin1234!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await login({ email, password });
      if (resp.status === 'ok') {
        navigate('/'); // Redirección a Home
      } else {
        setError('No fue posible iniciar sesión.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border rounded-xl p-6 shadow"
      >
        <h1 className="text-2xl font-semibold mb-4">Iniciar sesión</h1>

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          className="w-full border rounded p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="text-red-600 text-sm mb-3">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded p-2"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
