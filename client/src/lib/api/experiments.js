// client/src/lib/api/experiments.js

import { http } from './http';

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export async function listExperiments() {
  const res = await http.get('/api/experiments');
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Error al cargar experimentos');
  return res.json();
}

export async function getExperiment(slug) {
  const res = await http.get(`/api/experiments/${slug}`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Experimento no encontrado');
  return res.json();
}

// Obtiene la guía PDF precargada de un experimento
export async function getExperimentGuide(slug) {
  const res = await http.get(`/api/experiments/${slug}/guide`);
  if (!res.ok) throw new Error((await safeJson(res))?.message || 'Guía no disponible');
  return res.json();
}
