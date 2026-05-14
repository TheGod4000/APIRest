import { reactive, computed } from 'vue'
import * as authApi from '../api/auth'
import { refreshCsrf } from '../api/http'

const state = reactive({
  user: null,
  loading: false,
  error: null,
})

const isAuthenticated = computed(() => !!state.user)
const isAdmin = computed(() => state.user?.role === 'admin')

async function loadMe() {
  try {
    state.loading = true
    const data = await authApi.me()
    state.user = data.user || data
  } catch (e) {
    state.user = null
  } finally {
    state.loading = false
  }
}

async function login(username, password) {
  state.error = null
  state.loading = true
  try {
    const data = await authApi.login(username, password)
    state.user = data.user || data
    // Get a fresh CSRF token bound to the new auth context
    try {
      await refreshCsrf()
    } catch (e) {
      // ignore
    }
    return state.user
  } catch (e) {
    state.user = null
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Login failed'
    state.error = msg
    throw e
  } finally {
    state.loading = false
  }
}

async function logout() {
  try {
    await authApi.logout()
  } catch (e) {
    // ignore
  }
  state.user = null
  try {
    await refreshCsrf()
  } catch (e) {
    // ignore
  }
}

export const authStore = {
  state,
  isAuthenticated,
  isAdmin,
  loadMe,
  login,
  logout,
}

export default authStore
