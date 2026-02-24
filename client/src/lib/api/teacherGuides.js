// client/src/lib/api/teacherGuides.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export async function getMyCourses() {
  const res = await http.get('/api/teacher/courses');
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener cursos');
  return res.json();
}

export async function listMyGuides({ courseId } = {}) {
  const p = new URLSearchParams();
  if (courseId) p.set('courseId', courseId);
  const res = await http.get(`/api/teacher/guides?${p}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener guías');
  return res.json();
}

export async function createGuide({ courseId, experimentId, title, description, pdfFile }) {
  const form = new FormData();
  form.append('courseId', courseId);
  form.append('experimentId', experimentId);
  form.append('title', title);
  if (description) form.append('description', description);
  form.append('pdf', pdfFile);

  const token = http.getAccessToken?.() || localStorage.getItem('accessToken');
  const res = await fetch(`${http.BASE_URL || ''}/api/teacher/guides`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al crear guía');
  return res.json();
}

export async function updateGuide(id, { title, description, pdfFile } = {}) {
  const form = new FormData();
  if (title) form.append('title', title);
  if (description !== undefined) form.append('description', description);
  if (pdfFile) form.append('pdf', pdfFile);

  const token = http.getAccessToken?.() || localStorage.getItem('accessToken');
  const res = await fetch(`${http.BASE_URL || ''}/api/teacher/guides/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al actualizar guía');
  return res.json();
}

export async function publishGuide(id) {
  const res = await http.post(`/api/teacher/guides/${id}/publish`, {});
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al publicar');
  return res.json();
}

export async function unpublishGuide(id) {
  const res = await http.post(`/api/teacher/guides/${id}/unpublish`, {});
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al despublicar');
  return res.json();
}

export async function deleteGuide(id) {
  const res = await http.delete(`/api/teacher/guides/${id}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al eliminar');
  return res.json();
}