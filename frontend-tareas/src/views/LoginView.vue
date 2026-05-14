<template>
  <v-row justify="center" align="center" class="mt-8">
    <v-col cols="12" sm="8" md="5" lg="4">
      <v-card elevation="4">
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon icon="mdi-login-variant" class="mr-2" />
          Sign in
        </v-card-title>
        <v-card-subtitle>Task Management System</v-card-subtitle>

        <v-card-text>
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
            data-testid="login-error"
          >
            {{ error }}
          </v-alert>

          <v-form @submit.prevent="onSubmit" ref="formRef">
            <v-text-field
              v-model="username"
              label="Username"
              prepend-inner-icon="mdi-account"
              autocomplete="username"
              required
              :disabled="loading"
              data-testid="login-username"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              prepend-inner-icon="mdi-lock"
              autocomplete="current-password"
              required
              :disabled="loading"
              data-testid="login-password"
            />

            <v-btn
              type="submit"
              color="primary"
              block
              :loading="loading"
              :disabled="loading"
              data-testid="login-submit"
            >
              <v-icon start icon="mdi-login" />
              Login
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authStore from '../store/auth'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const formRef = ref(null)
const router = useRouter()
const route = useRoute()

async function onSubmit() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Username and password are required'
    return
  }
  loading.value = true
  try {
    await authStore.login(username.value, password.value)
    const dest = route.query.redirect || '/tasks'
    router.push(dest)
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
