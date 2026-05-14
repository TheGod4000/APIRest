<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-account-group-outline" class="mr-2" />
        Users
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreate"
          data-testid="user-create-btn"
        >
          New User
        </v-btn>
      </v-card-title>
    </v-card>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        item-value="id"
        density="comfortable"
        data-testid="user-table"
      >
        <template #item="{ item }">
          <tr data-testid="user-row">
            <td>{{ item.id }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.email }}</td>
            <td>
              <v-chip
                size="small"
                :color="item.role === 'admin' ? 'amber' : 'grey'"
                variant="tonal"
              >
                {{ item.role }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="openEdit(item)"
                data-testid="user-edit-btn"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
                data-testid="user-delete-btn"
              />
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <UserFormDialog v-model="dialogOpen" :user="editing" @saved="onSaved" />

    <v-dialog v-model="deleteOpen" max-width="420">
      <v-card>
        <v-card-title>Delete user?</v-card-title>
        <v-card-text>
          Permanently delete <strong>{{ deletingUser?.username }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteOpen = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="onDelete"
            data-testid="user-delete-confirm"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" :timeout="2500" location="top">
      {{ snack.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as usersApi from '../api/users'
import UserFormDialog from '../components/UserFormDialog.vue'

const headers = [
  { title: 'ID', key: 'id', width: 70 },
  { title: 'Username', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

const users = ref([])
const loading = ref(false)
const error = ref('')

const dialogOpen = ref(false)
const editing = ref(null)

const deleteOpen = ref(false)
const deletingUser = ref(null)
const deleting = ref(false)

const snack = reactive({ show: false, text: '', color: 'success' })

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const data = await usersApi.list()
    users.value = Array.isArray(data) ? data : data.users || []
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  dialogOpen.value = true
}
function openEdit(user) {
  editing.value = user
  dialogOpen.value = true
}
function confirmDelete(user) {
  deletingUser.value = user
  deleteOpen.value = true
}

async function onDelete() {
  if (!deletingUser.value) return
  deleting.value = true
  try {
    await usersApi.remove(deletingUser.value.id)
    snack.text = 'User deleted'
    snack.color = 'success'
    snack.show = true
    deleteOpen.value = false
    await loadUsers()
  } catch (e) {
    snack.text =
      e?.response?.data?.message || e?.message || 'Failed to delete user'
    snack.color = 'error'
    snack.show = true
  } finally {
    deleting.value = false
  }
}

function onSaved() {
  snack.text = 'User saved'
  snack.color = 'success'
  snack.show = true
  loadUsers()
}

onMounted(loadUsers)
</script>
