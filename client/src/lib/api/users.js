// client/src/lib/api/users.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

// ─── USUARIOS GLOBALES (todas las instituciones) ──────────────────────────────

// GET /api/admin/global-users
export async function listUsers({
  page = 1, pageSize = 20,
  role, isActive, search,
  institutionId,
  sort = 'createdAt', order = 'desc',
} = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  params.set('sort', sort);
  params.set('order', order);
  if (role) params.set('role', role);
  if (typeof isActive === 'boolean') params.set('isActive', String(isActive));
  if (search?.trim()) params.set('search', search.trim());
  if (institutionId) params.set('institutionId', institutionId);

  const res = await http.get(`/api/admin/global-users?${params.toString()}`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener los usuarios');
  }
  return res.json();
}

// POST /api/admin/global-users
export async function createUser({ email, password, firstName, lastName, role, institutionId }) {
  const res = await http.post('/api/admin/global-users', {
    email, password, firstName, lastName, role, institutionId,
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible crear el usuario');
  }
  return res.json();
}

// PATCH /api/admin/global-users/:id
export async function updateUser(id, { firstName, lastName, role, isActive, institutionId } = {}) {
  const body = {};
  if (typeof firstName === 'string') body.firstName = firstName;
  if (typeof lastName  === 'string') body.lastName  = lastName;
  if (typeof role      === 'string') body.role      = role;
  if (typeof isActive  === 'boolean') body.isActive = isActive;
  if (institutionId !== undefined) body.institutionId = institutionId;

  const res = await http.patch(`/api/admin/global-users/${id}`, body);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible actualizar el usuario');
  }
  return res.json();
}

// POST /api/admin/assign-admin
export async function assignAdmin({ userId, institutionId }) {
  const res = await http.post('/api/admin/assign-admin', { userId, institutionId });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible asignar admin');
  }
  return res.json();
}

// ─── APROBACIÓN DE USUARIOS ──────────────────────────────────────────────────

// POST /api/admin/users/:userId/approve
export async function approveUser(userId, role) {
  const res = await http.post(`/api/admin/users/${userId}/approve`, { role });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible aprobar el usuario');
  }
  return res.json();
}

// POST /api/admin/approve-teacher (legacy)
export async function approveTeacher(userId) {
  const res = await http.post('/api/admin/approve-teacher', { userId });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible aprobar el docente');
  }
  return res.json();
}

// GET /api/admin/pending-teachers (legacy)
export async function listPendingTeachers() {
  const res = await http.get('/api/admin/pending-teachers');
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener los docentes pendientes');
  }
  return res.json();
}