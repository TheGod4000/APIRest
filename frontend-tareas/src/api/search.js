import api from './http'

export function usersByTags(tags, mode = 'and') {
  const params = { mode }
  if (Array.isArray(tags)) params.tags = tags.join(',')
  else params.tags = tags
  return api.get('/admin/search/users-by-tags', { params }).then((r) => r.data)
}

export function tasksByTags(tags, mode = 'and') {
  const params = { mode }
  if (Array.isArray(tags)) params.tags = tags.join(',')
  else params.tags = tags
  return api.get('/admin/search/tasks-by-tags', { params }).then((r) => r.data)
}

export function tagsByUsers(users, mode = 'and') {
  const params = { mode }
  if (Array.isArray(users)) params.users = users.join(',')
  else params.users = users
  return api.get('/admin/search/tags-by-users', { params }).then((r) => r.data)
}
