import api from './http'

export function login(username, password) {
  return api.post('/auth/login', { username, password }).then((r) => r.data)
}

export function logout() {
  return api.post('/auth/logout').then((r) => r.data)
}

export function me() {
  return api.get('/auth/me').then((r) => r.data)
}

export function register(payload) {
  return api.post('/auth/register', payload).then((r) => r.data)
}
