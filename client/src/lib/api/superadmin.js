// client/src/lib/api/superadmin.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

// ─── INSTITUCIONES ────────────────────────────────────────────────────────

export async function listInstitutions({ isActive, search } = {}) {
  const p = new URLSearchParams();
  if (typeof isActive === 'boolean') p.set('isActive', String(isActive));
  if (search?.trim()) p.set('search', search.trim());

  const res = await http.get(`/api/superadmin/institutions?${p}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener instituciones');
  return res.json();
}

export async function createInstitution({ name }) {
  const res = await http.post('/api/superadmin/institutions', { name });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al crear institución');
  return res.json();
}

export async function updateInstitution(id, { name, isActive } = {}) {
  const body = {};
  if (typeof name === 'string') body.name = name;
  if (typeof isActive === 'boolean') body.isActive = isActive;

  const res = await http.patch(`/api/superadmin/institutions/${id}`, body);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al actualizar institución');
  return res.json();
}

// ─── USUARIOS ─────────────────────────────────────────────────────────────

export async function listUsers({
  page = 1, pageSize = 20,
  role, isActive, search,
  institutionId,
  sort = 'createdAt', order = 'desc',
} = {}) {
  const p = new URLSearchParams();
  p.set('page', String(page));
  p.set('pageSize', String(pageSize));
  p.set('sort', sort);
  p.set('order', order);
  if (role) p.set('role', role);
  if (typeof isActive === 'boolean') p.set('isActive', String(isActive));
  if (search?.trim()) p.set('search', search.trim());
  if (institutionId) p.set('institutionId', institutionId);

  const res = await http.get(`/api/superadmin/users?${p}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener usuarios');
  return res.json();
}

export async function createUser({ email, password, firstName, lastName, role, institutionId }) {
  const res = await http.post('/api/superadmin/users', {
    email, password, firstName, lastName, role, institutionId,
  });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al crear usuario');
  return res.json();
}

export async function updateUser(id, { firstName, lastName, role, isActive, institutionId } = {}) {
  const body = {};
  if (typeof firstName === 'string') body.firstName = firstName;
  if (typeof lastName === 'string') body.lastName = lastName;
  if (typeof role === 'string') body.role = role;
  if (typeof isActive === 'boolean') body.isActive = isActive;
  if (institutionId !== undefined) body.institutionId = institutionId;

  const res = await http.patch(`/api/superadmin/users/${id}`, body);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al actualizar usuario');
  return res.json();
}

export async function assignAdmin({ userId, institutionId }) {
  const res = await http.post('/api/superadmin/assign-admin', { userId, institutionId });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al asignar admin');
  return res.json();
}