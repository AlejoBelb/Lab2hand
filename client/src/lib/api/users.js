// client/src/lib/api/users.js

import { http } from './http';

// Lista usuarios con filtros y paginación
export async function listUsers({ page = 1, pageSize = 10, role, isActive, search, sort = 'createdAt', order = 'desc' } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (role) params.set('role', role);
  if (typeof isActive === 'boolean') params.set('isActive', String(isActive));
  if (search && search.trim()) params.set('search', search.trim());
  if (sort) params.set('sort', sort);
  if (order) params.set('order', order);

  const res = await http.get(`/api/users?${params.toString()}`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener la lista de usuarios');
  }
  return res.json();
}

// Obtiene un usuario por id
export async function getUser(id) {
  const res = await http.get(`/api/users/${id}`);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible obtener el usuario');
  }
  return res.json();
}

// Actualiza un usuario por id
export async function patchUser(id, { firstName, lastName, role, isActive } = {}) {
  const body = {};
  if (typeof firstName !== 'undefined') body.firstName = firstName;
  if (typeof lastName !== 'undefined') body.lastName = lastName;
  if (typeof role !== 'undefined') body.role = role;
  if (typeof isActive !== 'undefined') body.isActive = isActive;

  const res = await http.patch(`/api/users/${id}`, body);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || 'No fue posible actualizar el usuario');
  }
  return res.json();
}

// Utilidad: intenta parsear JSON; si falla, retorna null
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
