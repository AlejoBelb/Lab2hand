// client/src/lib/api/courses.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

// ─── Cursos ───────────────────────────────────────────────────────────────

export async function listCourses({ page = 1, pageSize = 20, status, search, sort, order } = {}) {
  const p = new URLSearchParams();
  p.set('page', String(page));
  p.set('pageSize', String(pageSize));
  if (status) p.set('status', status);
  if (search?.trim()) p.set('search', search.trim());
  if (sort) p.set('sort', sort);
  if (order) p.set('order', order);

  const res = await http.get(`/api/admin/courses?${p}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener cursos');
  return res.json();
}

export async function getCourse(id) {
  const res = await http.get(`/api/admin/courses/${id}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener el curso');
  return res.json();
}

export async function createCourse({ name, grade, group, academicYear, startsAt, endsAt }) {
  const res = await http.post('/api/admin/courses', { name, grade, group, academicYear, startsAt, endsAt });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al crear el curso');
  return res.json();
}

export async function updateCourse(id, data) {
  const res = await http.patch(`/api/admin/courses/${id}`, data);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al actualizar el curso');
  return res.json();
}

// ─── Membresías ───────────────────────────────────────────────────────────

export async function addTeacher(courseId, { teacherId, role }) {
  const res = await http.post(`/api/admin/courses/${courseId}/teachers`, { teacherId, role });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al agregar docente');
  return res.json();
}

export async function removeTeacher(courseId, teacherId) {
  const res = await http.delete(`/api/admin/courses/${courseId}/teachers/${teacherId}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al remover docente');
  return res.json();
}

export async function addStudent(courseId, { studentId }) {
  const res = await http.post(`/api/admin/courses/${courseId}/students`, { studentId });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al agregar estudiante');
  return res.json();
}

export async function removeStudent(courseId, studentId) {
  const res = await http.delete(`/api/admin/courses/${courseId}/students/${studentId}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al remover estudiante');
  return res.json();
}

export async function addExperiment(courseId, experimentId) {
  const res = await http.post(`/api/admin/courses/${courseId}/experiments`, { experimentId });
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al agregar experimento');
  return res.json();
}

export async function removeExperiment(courseId, experimentId) {
  const res = await http.delete(`/api/admin/courses/${courseId}/experiments/${experimentId}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al remover experimento');
  return res.json();
}