<template>
  <div>
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-clipboard-list-outline" class="mr-2" />
        My Tasks
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreate"
          data-testid="task-create-btn"
        >
          New Task
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row align="center" dense>
          <v-col cols="12" md="7">
            <v-combobox
              v-model="searchTags"
              :items="tagNames"
              label="Filter by tags"
              multiple
              chips
              clearable
              closable-chips
              hide-no-data
              data-testid="task-search-tags"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn-toggle
              v-model="searchMode"
              color="primary"
              mandatory
              divided
              density="comfortable"
            >
              <v-btn value="and" data-testid="search-mode-and">AND</v-btn>
              <v-btn value="or" data-testid="search-mode-or">OR</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" md="2" class="d-flex">
            <v-btn
              variant="tonal"
              prepend-icon="mdi-magnify"
              @click="runSearch"
              :loading="loading"
              data-testid="task-search-go"
            >
              Search
            </v-btn>
            <v-btn
              icon="mdi-refresh"
              variant="text"
              class="ml-2"
              @click="resetSearch"
              data-testid="task-search-reset"
            />
          </v-col>
        </v-row>
      </v-card-text>
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
        :items="tasks"
        :loading="loading"
        item-value="id"
        density="comfortable"
        class="task-table"
        data-testid="task-table"
      >
        <template #item="{ item }">
          <tr data-testid="task-row">
            <td>{{ item.id }}</td>
            <td>{{ item.title }}</td>
            <td class="text-truncate" style="max-width: 300px">
              {{ item.description }}
            </td>
            <td>
              <v-chip size="small" :color="statusColor(item.status)" variant="tonal">
                {{ item.status }}
              </v-chip>
            </td>
            <td>
              <v-chip
                v-for="t in item.tags || []"
                :key="t.id"
                size="x-small"
                class="ma-1"
                color="indigo"
                variant="outlined"
              >
                {{ t.name }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="openEdit(item)"
                data-testid="task-edit-btn"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
                data-testid="task-delete-btn"
              />
            </td>
          </tr>
        </template>
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>
      </v-data-table>
    </v-card>

    <TaskFormDialog
      v-model="dialogOpen"
      :task="editingTask"
      @saved="onSaved"
    />

    <v-dialog v-model="deleteOpen" max-width="420">
      <v-card>
        <v-card-title>Delete task?</v-card-title>
        <v-card-text>
          This will permanently delete
          <strong>{{ deletingTask?.title }}</strong
          >.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteOpen = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="onDelete"
            data-testid="task-delete-confirm"
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
import { ref, reactive, onMounted, computed } from 'vue'
import * as tasksApi from '../api/tasks'
import * as tagsApi from '../api/tags'
import TaskFormDialog from '../components/TaskFormDialog.vue'

const headers = [
  { title: 'ID', key: 'id', sortable: true, width: 70 },
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Status', key: 'status' },
  { title: 'Tags', key: 'tags', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

const tasks = ref([])
const allTags = ref([])
const loading = ref(false)
const error = ref('')

const searchTags = ref([])
const searchMode = ref('and')

const dialogOpen = ref(false)
const editingTask = ref(null)

const deleteOpen = ref(false)
const deletingTask = ref(null)
const deleting = ref(false)

const snack = reactive({ show: false, text: '', color: 'success' })

const tagNames = computed(() => allTags.value.map((t) => t.name))

function statusColor(s) {
  switch (s) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'info'
    case 'pending':
    default:
      return 'warning'
  }
}

async function loadAllTags() {
  try {
    const data = await tagsApi.list()
    allTags.value = Array.isArray(data) ? data : data.tags || []
  } catch (e) {
    // silent
  }
}

async function loadTasks() {
  loading.value = true
  error.value = ''
  try {
    const data = await tasksApi.list()
    tasks.value = Array.isArray(data) ? data : data.tasks || []
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Failed to load tasks'
  } finally {
    loading.value = false
  }
}

async function runSearch() {
  if (!searchTags.value.length) {
    return loadTasks()
  }
  loading.value = true
  error.value = ''
  try {
    const data = await tasksApi.searchByTags(searchTags.value, searchMode.value)
    tasks.value = Array.isArray(data) ? data : data.tasks || []
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Search failed'
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchTags.value = []
  searchMode.value = 'and'
  loadTasks()
}

function openCreate() {
  editingTask.value = null
  dialogOpen.value = true
}
function openEdit(task) {
  editingTask.value = task
  dialogOpen.value = true
}
function confirmDelete(task) {
  deletingTask.value = task
  deleteOpen.value = true
}

async function onDelete() {
  if (!deletingTask.value) return
  deleting.value = true
  try {
    await tasksApi.remove(deletingTask.value.id)
    snack.text = 'Task deleted'
    snack.color = 'success'
    snack.show = true
    deleteOpen.value = false
    await loadTasks()
  } catch (e) {
    snack.text =
      e?.response?.data?.message || e?.message || 'Failed to delete task'
    snack.color = 'error'
    snack.show = true
  } finally {
    deleting.value = false
  }
}

function onSaved() {
  snack.text = 'Task saved'
  snack.color = 'success'
  snack.show = true
  loadTasks()
}

onMounted(async () => {
  await loadAllTags()
  await loadTasks()
})
</script>
