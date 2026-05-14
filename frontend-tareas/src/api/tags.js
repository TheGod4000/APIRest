import api from './http'

export function list() {
  return api.get('/tags').then((r) => r.data)
}

export function create(payload) {
  return api.post('/tags', payload).then((r) => r.data)
}

export function update(id, payload) {
  return api.put(`/tags/${id}`, payload).then((r) => r.data)
}

export function remove(id) {
  return api.delete(`/tags/${id}`).then((r) => r.data)
}
