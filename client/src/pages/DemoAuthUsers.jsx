// client/src/pages/DemoAuthUsers.jsx

import { useState } from 'react';
import { login, logout, getMe } from '../lib/api/auth';
import { listUsers, patchUser } from '../lib/api/users';

export default function DemoAuthUsers() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState('');

  async function doLogin() {
    setLoading(true);
    setLog('Iniciando sesión...');
    try {
      const profile = await login({ email, password });
      setMe(profile);
      setLog('Login OK');
    } catch (e) {
      setLog(`Error login: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function doGetMe() {
    setLoading(true);
    setLog('Obteniendo perfil...');
    try {
      const profile = await getMe();
      setMe(profile);
      setLog('Perfil OK');
    } catch (e) {
      setLog(`Error getMe: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function doListUsers() {
    setLoading(true);
    setLog('Listando usuarios...');
    try {
      const result = await listUsers({ page: 1, pageSize: 10, sort: 'createdAt', order: 'desc' });
      setUsers(result.items || []);
      setLog(`Usuarios cargados: ${result.items?.length || 0}`);
    } catch (e) {
      setLog(`Error listUsers: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function doPatchFirstUser() {
    if (!users.length) {
      setLog('No hay usuarios cargados');
      return;
    }
    const first = users[0];
    setLoading(true);
    setLog(`Actualizando usuario ${first.id}...`);
    try {
      const updated = await patchUser(first.id, { firstName: 'DemoUpdated' });
      setUsers((prev) => prev.map((u) => (u.id === updated.user.id ? updated.user : u)));
      setLog('Usuario actualizado');
    } catch (e) {
      setLog(`Error patchUser: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function doLogout() {
    setLoading(true);
    setLog('Cerrando sesión...');
    try {
      await logout({ revokeServer: true });
      setMe(null);
      setUsers([]);
      setLog('Logout OK');
    } catch (e) {
      setLog(`Error logout: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Demo Auth + Users</h1>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Login</h2>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr' }}>
          <label>
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="tu@email.com"
            />
          </label>

          <label>
            Contraseña
            <div className="input-group">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-label="Contraseña"
                aria-describedby="toggle-password-visibility"
              />
              <button
                id="toggle-password-visibility"
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword ? 'true' : 'false'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       width="18" height="18" aria-hidden="true" focusable="false">
                    <path fill="currentColor"
                          d="M12 5c5.523 0 10 4.477 10 7s-4.477 7-10 7-10-4.477-10-7 4.477-7 10-7Zm0 2C8.134 7 4.828 9.642 3.65 12c1.179 2.358 4.484 5 8.35 5s7.172-2.642 8.35-5C19.172 9.642 15.866 7 12 7Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       width="18" height="18" aria-hidden="true" focusable="false">
                    <path fill="currentColor"
                          d="M3.707 2.293 21.707 20.293 20.293 21.707 16.883 18.297C15.423 18.765 13.77 19 12 19 6.477 19 2 14.523 2 12c0-1.098.716-2.698 2.063-4.137l-1.77-1.77 1.414-1.414Zm4.2 4.2C9.113 5.55 10.49 5 12 5c5.523 0 10 4.477 10 7 0 .817-.319 1.91-.98 3.05l-3.4-3.4A5 5 0 0 0 10.943 7.5l-3.036-3.007ZM9.88 11.293a2 2 0 0 0 2.827 2.827l-2.827-2.827Z"/>
                  </svg>
                )}
              </button>
            </div>
          </label>

          <div className="btn-row" style={{ marginTop: '0.5rem' }}>
            <button className="primary" onClick={doLogin} disabled={loading}>Login</button>
            <button onClick={doGetMe} disabled={loading}>getMe</button>
            <button onClick={doLogout} disabled={loading}>Logout</button>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Users (ADMIN)</h2>
        <div className="btn-row">
          <button onClick={doListUsers} disabled={loading}>Listar usuarios</button>
          <button onClick={doPatchFirstUser} disabled={loading}>Actualizar primero</button>
        </div>

        <div className="mt-2">
          <strong>Perfil:</strong>
          <pre className="card" style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            {me ? JSON.stringify(me, null, 2) : 'No autenticado'}
          </pre>
        </div>

        <div className="mt-2">
          <strong>Usuarios:</strong>
          <pre className="card" style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            {users.length ? JSON.stringify(users, null, 2) : 'Sin datos'}
          </pre>
        </div>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <strong>Estado:</strong> {loading ? 'Cargando...' : 'Idle'}
        <div className="mt-1">
          <strong>Log:</strong>
          <pre className="card" style={{ overflowX: 'auto', marginTop: '0.5rem' }}>{log}</pre>
        </div>
      </section>
    </div>
  );
}
