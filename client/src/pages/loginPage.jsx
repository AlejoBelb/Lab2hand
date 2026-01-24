// client/src/pages/loginPage.jsx
// Página de login que consume el servicio y redirige a Home al autenticar.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginService } from '../services/auth.service';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin1234!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginService({ email, password });
      if (res?.status === 'ok') {
        navigate('/');
      } else {
        setError('No fue posible iniciar sesión.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border p-6 shadow">
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

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded p-2"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
          <button
            type="button"
            className="flex-1 border rounded p-2"
            onClick={() => { setEmail('admin@example.com'); setPassword('Admin1234!'); setError(null); }}
          >
            Cancelar
          </button>
        </div>

        <p className="text-xs mt-3 opacity-70">
          Credenciales de ejemplo: admin@example.com / Admin1234!
        </p>
      </form>
    </div>
  );
}
