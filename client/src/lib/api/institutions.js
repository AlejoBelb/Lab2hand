// client/src/lib/api/institutions.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

// GET /api/admin/institutions
export async function listInstitutions({ isActive, search } = {}) {
  const params = new URLSearchParams();
  if (typeof isActive === 'boolean') params.set('isActive', String(isActive));
  if (search?.trim()) params.set('search', search.trim());

  const res = await http.get(`/api/admin/institutions?${params.toString()}`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener las instituciones');
  }
  return res.json();
}

// GET /api/admin/institutions/:id
export async function getInstitution(id) {
  const res = await http.get(`/api/admin/institutions/${id}`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener la institución');
  }
  return res.json();
}

// POST /api/admin/institutions
export async function createInstitution({ name }) {
  const res = await http.post('/api/admin/institutions', { name });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible crear la institución');
  }
  return res.json();
}

// PATCH /api/admin/institutions/:id
export async function updateInstitution(id, { name, isActive } = {}) {
  const body = {};
  if (typeof name === 'string') body.name = name;
  if (typeof isActive === 'boolean') body.isActive = isActive;

  const res = await http.patch(`/api/admin/institutions/${id}`, body);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible actualizar la institución');
  }
  return res.json();
}
