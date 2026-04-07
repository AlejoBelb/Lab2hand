// client/src/lib/api/teacherStudents.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export async function listStudents({ status, search } = {}) {
  const p = new URLSearchParams();
  if (status) p.set('status', status);
  if (search?.trim()) p.set('search', search.trim());
  const res = await http.get(`/api/teacher/students?${p}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener estudiantes');
  return res.json();
}

export async function approveStudent(id) {
  const res = await http.post(`/api/teacher/students/${id}/approve`, {});
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al aprobar');
  return res.json();
}

export async function rejectStudent(id) {
  const res = await http.post(`/api/teacher/students/${id}/reject`, {});
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al rechazar');
  return res.json();
}

export async function enrollStudent(id, courseId) {
  const res = await http.post(`/api/teacher/students/${id}/enroll`, { courseId });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al inscribir');
  return res.json();
}

export async function unenrollStudent(id, courseId) {
  const res = await http.delete(`/api/teacher/students/${id}/courses/${courseId}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al remover');
  return res.json();
}
