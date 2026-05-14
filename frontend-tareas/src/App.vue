<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable" v-if="auth.isAuthenticated.value">
      <v-app-bar-title>
        <v-icon icon="mdi-checkbox-marked-circle-outline" class="mr-2" />
        Task Management
      </v-app-bar-title>

      <v-spacer />

      <v-btn
        variant="text"
        :to="{ name: 'tasks' }"
        data-testid="tasks-link"
        prepend-icon="mdi-clipboard-list-outline"
      >
        Tasks
      </v-btn>

      <v-btn
        variant="text"
        :to="{ name: 'tags' }"
        data-testid="tags-link"
        prepend-icon="mdi-tag-multiple-outline"
      >
        Tags
      </v-btn>

      <template v-if="auth.isAdmin.value">
        <v-btn
          variant="text"
          :to="{ name: 'admin-users' }"
          data-testid="admin-users-link"
          prepend-icon="mdi-account-group-outline"
        >
          Users
        </v-btn>
        <v-btn
          variant="text"
          :to="{ name: 'admin-search' }"
          data-testid="advanced-search-link"
          prepend-icon="mdi-magnify"
        >
          Advanced Search
        </v-btn>
      </template>

      <v-divider vertical class="mx-2" />

      <span class="text-caption mr-3" data-testid="current-user">
        {{ auth.state.user?.username }}
        <v-chip
          v-if="auth.isAdmin.value"
          size="x-small"
          color="amber"
          class="ml-1"
          variant="elevated"
        >
          admin
        </v-chip>
      </span>

      <v-btn
        variant="tonal"
        color="white"
        data-testid="logout-btn"
        prepend-icon="mdi-logout"
        @click="onLogout"
      >
        Logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import authStore from './store/auth'

const auth = authStore
const router = useRouter()

const snackbar = reactive({ show: false, text: '', color: 'info' })

async function onLogout() {
  await auth.logout()
  snackbar.text = 'Logged out'
  snackbar.color = 'success'
  snackbar.show = true
  router.push('/login')
}
</script>
