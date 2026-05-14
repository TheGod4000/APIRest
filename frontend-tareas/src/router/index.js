import { createRouter, createWebHistory } from 'vue-router'
import authStore from '../store/auth'

import LoginView from '../views/LoginView.vue'
import TasksView from '../views/TasksView.vue'
import TagsView from '../views/TagsView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'
import AdvancedSearchView from '../views/AdvancedSearchView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/', redirect: '/tasks' },
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/tasks', name: 'tasks', component: TasksView },
  { path: '/tags', name: 'tags', component: TagsView },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
    meta: { adminOnly: true },
  },
  {
    path: '/admin/search',
    name: 'admin-search',
    component: AdvancedSearchView,
    meta: { adminOnly: true },
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authed = authStore.isAuthenticated.value
  const admin = authStore.isAdmin.value

  if (!to.meta.public && !authed) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && authed) {
    return { path: '/tasks' }
  }
  if (to.meta.adminOnly && !admin) {
    return { path: '/tasks' }
  }
  return true
})

export default router
