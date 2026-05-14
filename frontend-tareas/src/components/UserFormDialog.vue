<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="560"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          :icon="isEdit ? 'mdi-account-edit' : 'mdi-account-plus'"
          class="mr-2"
        />
        {{ isEdit ? 'Edit User' : 'New User' }}
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          {{ error }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="onSave">
          <v-text-field
            v-model="form.username"
            label="Username"
            required
            :disabled="saving"
            data-testid="user-username"
          />
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            required
            :disabled="saving"
            data-testid="user-email"
          />
          <v-text-field
            v-model="form.password"
            :label="isEdit ? 'New password (leave blank to keep)' : 'Password'"
            type="password"
            :required="!isEdit"
            :disabled="saving"
            data-testid="user-password"
          />
          <v-select
            v-model="form.role"
            :items="roleOptions"
            label="Role"
            :disabled="saving"
            data-testid="user-role"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="onCancel" :disabled="saving">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="saving"
          @click="onSave"
          data-testid="user-save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as usersApi from '../api/users'
import * as authApi from '../api/auth'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const roleOptions = ['admin', 'user']

const form = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user',
})

const saving = ref(false)
const error = ref('')
const formRef = ref(null)

const isEdit = computed(() => !!props.user?.id)

function resetFromUser() {
  if (props.user) {
    form.username = props.user.username || ''
    form.email = props.user.email || ''
    form.password = ''
    form.role = props.user.role || 'user'
  } else {
    form.username = ''
    form.email = ''
    form.password = ''
    form.role = 'user'
  }
  error.value = ''
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetFromUser()
  }
)
watch(() => props.user, resetFromUser)

onMounted(() => {
  if (props.modelValue) resetFromUser()
})

function onCancel() {
  emit('update:modelValue', false)
}

async function onSave() {
  if (!form.username.trim() || !form.email.trim()) {
    error.value = 'Username and email are required'
    return
  }
  if (!isEdit.value && !form.password) {
    error.value = 'Password is required'
    return
  }

  saving.value = true
  error.value = ''
  try {
    let saved
    if (isEdit.value) {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
      }
      if (form.password) payload.password = form.password
      saved = await usersApi.update(props.user.id, payload)
    } else {
      // Use admin register endpoint to create new users
      saved = await authApi.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
    }
    emit('saved', saved)
    emit('update:modelValue', false)
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Failed to save user'
  } finally {
    saving.value = false
  }
}
</script>
