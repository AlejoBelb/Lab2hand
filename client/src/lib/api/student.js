// client/src/lib/api/student.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export async function getMyCourses() {
  const res = await http.get('/api/student/courses');
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener cursos');
  return res.json();
}

export async function getCourseGuides(courseId) {
  const res = await http.get(`/api/student/courses/${courseId}/guides`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al obtener guías');
  return res.json();
}
