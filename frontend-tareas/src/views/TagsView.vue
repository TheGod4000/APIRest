<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-tag-multiple-outline" class="mr-2" />
        Tags
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreate"
          data-testid="tag-create-btn"
        >
          New Tag
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
        :items="tags"
        :loading="loading"
        item-value="id"
        density="comfortable"
        data-testid="tag-table"
      >
        <template #item="{ item }">
          <tr data-testid="tag-row">
            <td>{{ item.id }}</td>
            <td>
              <v-chip color="indigo" variant="tonal" size="small">
                {{ item.name }}
              </v-chip>
            </td>
            <td class="text-right">
              <template v-if="auth.isAdmin.value">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEdit(item)"
                  data-testid="tag-edit-btn"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                  data-testid="tag-delete-btn"
                />
              </template>
              <span v-else class="text-caption text-disabled">read-only</span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="480" persistent>
      <v-card>
        <v-card-title>
          {{ editing?.id ? 'Edit Tag' : 'New Tag' }}
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="dialogError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            {{ dialogError }}
          </v-alert>
          <v-text-field
            v-model="tagName"
            label="Name"
            autofocus
            :disabled="saving"
            data-testid="tag-name-input"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="dialogOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            @click="onSave"
            data-testid="tag-save-btn"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteOpen" max-width="420">
      <v-card>
        <v-card-title>Delete tag?</v-card-title>
        <v-card-text>
          Permanently delete <strong>{{ deletingTag?.name }}</strong
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
            data-testid="tag-delete-confirm"
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
import * as tagsApi from '../api/tags'
import authStore from '../store/auth'

const auth = authStore

const headers = [
  { title: 'ID', key: 'id', width: 80 },
  { title: 'Name', key: 'name' },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

const tags = ref([])
const loading = ref(false)
const error = ref('')

const dialogOpen = ref(false)
const editing = ref(null)
const tagName = ref('')
const saving = ref(false)
const dialogError = ref('')

const deleteOpen = ref(false)
const deletingTag = ref(null)
const deleting = ref(false)

const snack = reactive({ show: false, text: '', color: 'success' })

async function loadTags() {
  loading.value = true
  error.value = ''
  try {
    const data = await tagsApi.list()
    tags.value = Array.isArray(data) ? data : data.tags || []
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || 'Failed to load tags'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  tagName.value = ''
  dialogError.value = ''
  dialogOpen.value = true
}
function openEdit(tag) {
  editing.value = tag
  tagName.value = tag.name
  dialogError.value = ''
  dialogOpen.value = true
}

async function onSave() {
  if (!tagName.value.trim()) {
    dialogError.value = 'Name is required'
    return
  }
  saving.value = true
  dialogError.value = ''
  try {
    if (editing.value?.id) {
      await tagsApi.update(editing.value.id, { name: tagName.value.trim() })
    } else {
      await tagsApi.create({ name: tagName.value.trim() })
    }
    snack.text = 'Tag saved'
    snack.color = 'success'
    snack.show = true
    dialogOpen.value = false
    await loadTags()
  } catch (e) {
    dialogError.value =
      e?.response?.data?.message || e?.message || 'Failed to save tag'
  } finally {
    saving.value = false
  }
}

function confirmDelete(tag) {
  deletingTag.value = tag
  deleteOpen.value = true
}

async function onDelete() {
  if (!deletingTag.value) return
  deleting.value = true
  try {
    await tagsApi.remove(deletingTag.value.id)
    snack.text = 'Tag deleted'
    snack.color = 'success'
    snack.show = true
    deleteOpen.value = false
    await loadTags()
  } catch (e) {
    snack.text =
      e?.response?.data?.message || e?.message || 'Failed to delete tag'
    snack.color = 'error'
    snack.show = true
  } finally {
    deleting.value = false
  }
}

onMounted(loadTags)
</script>
