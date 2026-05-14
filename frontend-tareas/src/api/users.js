import api from './http'

export function list() {
  return api.get('/users').then((r) => r.data)
}

export function get(id) {
  return api.get(`/users/${id}`).then((r) => r.data)
}

export function create(payload) {
  return api.post('/users', payload).then((r) => r.data)
}

export function update(id, payload) {
  return api.put(`/users/${id}`, payload).then((r) => r.data)
}

export function remove(id) {
  return api.delete(`/users/${id}`).then((r) => r.data)
}
