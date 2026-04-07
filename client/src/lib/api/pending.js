// client/src/lib/api/pending.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export async function listPendingUsers() {
  const res = await http.get('/api/admin/pending-users');
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener pendientes');
  return res.json();
}

export async function approveUser(userId, role) {
  const res = await http.post(`/api/admin/users/${userId}/approve`, { role });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al aprobar usuario');
  return res.json();
}
