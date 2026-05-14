/**
 * services/auth.api.js
 * Comunicación con los endpoints de autenticación.
 *
 * Seguridad:
 *  - credentials: 'include'  → el navegador envía la cookie JWT (HttpOnly) automáticamente
 *  - x-api-key header        → protege el endpoint de login (validado en el servidor)
 *  - x-csrf-token header     → sólo en peticiones mutantes (POST /logout)
 *
 * Recuperación de sesión tras recarga de página:
 *  getCsrfFromCookie() lee la cookie `csrf_token` (no-HttpOnly) que el servidor establece
 *  junto al JWT. Si existe, el SPA puede llamar a GET /auth/verify para recuperar el
 *  estado sin requerir un nuevo login.
 */

const API_BASE = '/api';

/**
 * Lee el valor de la cookie `csrf_token` del navegador.
 * Sólo funciona en el cliente (no SSR). Devuelve '' si no existe.
 */
export function getCsrfFromCookie() {
  if (typeof document === 'undefined') return '';
  const entry = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('csrf_token='));
  return entry ? decodeURIComponent(entry.split('=')[1]) : '';
}

// API Key fija del frontend (el backend la valida para proteger /login)
const API_KEY = '123456789';

/**
 * POST /api/auth/login
 * Envía email + password en el body; la API Key va como header x-api-key.
 * El servidor responde con { success, csrfToken, usuario } y establece las cookies.
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method:      'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key':    API_KEY
    },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
  return data;
}

/**
 * POST /api/auth/logout
 * Requiere el CSRF token para proteger esta petición mutante.
 */
export async function logout(csrfToken) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method:      'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al cerrar sesión');
  return data;
}

/**
 * GET /api/auth/verify
 * No requiere CSRF (GET es safe). Devuelve { success, usuario, csrfToken }.
 * Se usa para restaurar el estado de autenticación tras recargar la página.
 */
export async function verifyAuth() {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('No autenticado');
  return res.json();
}
