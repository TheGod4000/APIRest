import axios from 'axios'

function readCookie(name) {
  const m = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[$()*+./?[\]^{|}-]/g, '\\$&') + '=([^;]*)')
  )
  return m ? decodeURIComponent(m[1]) : null
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
})

const MUTATING = ['post', 'put', 'patch', 'delete']

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  if (MUTATING.includes(method)) {
    const token = readCookie('csrf_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['x-csrf-token'] = token
    }
  }
  return config
})

let refreshingCsrf = null
async function refreshCsrf() {
  if (!refreshingCsrf) {
    refreshingCsrf = api.get('/csrf').finally(() => {
      refreshingCsrf = null
    })
  }
  return refreshingCsrf
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    if (!response || !config) return Promise.reject(error)

    const status = response.status
    const data = response.data || {}
    const message =
      (typeof data === 'string' ? data : data.message || data.error || '') + ''

    // CSRF retry
    if (
      status === 403 &&
      /csrf/i.test(message) &&
      !config.__csrfRetried
    ) {
      config.__csrfRetried = true
      try {
        await refreshCsrf()
        return api.request(config)
      } catch (e) {
        return Promise.reject(error)
      }
    }

    // Auth redirect
    if (status === 401) {
      const path = window.location.pathname
      if (path !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default api
export { refreshCsrf }
