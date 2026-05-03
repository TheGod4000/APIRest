/**
 * services/tareas.api.js
 * Todas las peticiones incluyen:
 *  - credentials: 'include'  → envía la cookie JWT (HttpOnly) automáticamente
 *  - x-csrf-token header     → requerido en peticiones mutantes (POST/PUT/PATCH/DELETE)
 */

const API_BASE = '/api/tareas';

function buildHeaders(csrfToken = '') {
  const h = { 'Content-Type': 'application/json' };
  if (csrfToken) h['x-csrf-token'] = csrfToken;
  return h;
}

export async function obtenerTodas() {
  const res = await fetch(API_BASE, { credentials: 'include' });
  return res.json();
}

export async function obtenerPorId(id) {
  const res = await fetch(`${API_BASE}/${id}`, { credentials: 'include' });
  return res.json();
}

export async function buscar(query) {
  const res = await fetch(`${API_BASE}/buscar?q=${encodeURIComponent(query)}`, {
    credentials: 'include'
  });
  return res.json();
}

export async function crear(tarea, csrfToken) {
  const res = await fetch(API_BASE, {
    method:      'POST',
    credentials: 'include',
    headers:     buildHeaders(csrfToken),
    body:        JSON.stringify(tarea)
  });
  return res.json();
}

export async function actualizarCompleta(id, tarea, csrfToken) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method:      'PUT',
    credentials: 'include',
    headers:     buildHeaders(csrfToken),
    body:        JSON.stringify(tarea)
  });
  return res.json();
}

export async function actualizarParcial(id, datos, csrfToken) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method:      'PATCH',
    credentials: 'include',
    headers:     buildHeaders(csrfToken),
    body:        JSON.stringify(datos)
  });
  return res.json();
}

export async function eliminar(id, csrfToken) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method:      'DELETE',
    credentials: 'include',
    headers:     buildHeaders(csrfToken)
  });
  return res.json();
}
