import api from './http'

export function list() {
  return api.get('/tasks').then((r) => r.data)
}

export function get(id) {
  return api.get(`/tasks/${id}`).then((r) => r.data)
}

export function create(payload) {
  return api.post('/tasks', payload).then((r) => r.data)
}

export function update(id, payload) {
  return api.put(`/tasks/${id}`, payload).then((r) => r.data)
}

export function remove(id) {
  return api.delete(`/tasks/${id}`).then((r) => r.data)
}

export function searchByTags(tags, mode = 'and') {
  const params = {}
  if (Array.isArray(tags)) params.tags = tags.join(',')
  else if (tags) params.tags = tags
  if (mode) params.mode = mode
  return api.get('/tasks/search', { params }).then((r) => r.data)
}
