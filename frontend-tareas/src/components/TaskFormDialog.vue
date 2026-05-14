<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="640"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          :icon="isEdit ? 'mdi-pencil' : 'mdi-plus-box-outline'"
          class="mr-2"
        />
        {{ isEdit ? 'Edit Task' : 'New Task' }}
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
            v-model="form.title"
            label="Title"
            required
            :disabled="saving"
            data-testid="task-title"
          />
          <v-textarea
            v-model="form.description"
            label="Description"
            rows="3"
            auto-grow
            :disabled="saving"
            data-testid="task-description"
          />
          <v-select
            v-model="form.status"
            :items="statusOptions"
            label="Status"
            :disabled="saving"
            data-testid="task-status"
          />
          <v-select
            v-model="form.tagIds"
            :items="allTags"
            item-title="name"
            item-value="id"
            label="Tags"
            multiple
            chips
            closable-chips
            :loading="loadingTags"
            :disabled="saving"
            data-testid="task-tags"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="onCancel"
          :disabled="saving"
          data-testid="task-cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="saving"
          @click="onSave"
          data-testid="task-save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as tasksApi from '../api/tasks'
import * as tagsApi from '../api/tags'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const statusOptions = ['pending', 'in_progress', 'completed']

const form = reactive({
  title: '',
  description: '',
  status: 'pending',
  tagIds: [],
})

const allTags = ref([])
const loadingTags = ref(false)
const saving = ref(false)
const error = ref('')
const formRef = ref(null)

const isEdit = computed(() => !!props.task?.id)

async function loadTags() {
  loadingTags.value = true
  try {
    const data = await tagsApi.list()
    allTags.value = Array.isArray(data) ? data : data.tags || []
  } catch (e) {
    allTags.value = []
  } finally {
    loadingTags.value = false
  }
}

function resetFromTask() {
  if (props.task) {
    form.title = props.task.title || ''
    form.description = props.task.description || ''
    form.status = props.task.status || 'pending'
    form.tagIds = (props.task.tags || []).map((t) => t.id)
  } else {
    form.title = ''
    form.description = ''
    form.status = 'pending'
    form.tagIds = []
  }
  error.value = ''
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetFromTask()
      loadTags()
    }
  }
)

watch(() => props.task, resetFromTask)

onMounted(() => {
  if (props.modelValue) {
    resetFromTask()
    loadTags()
  }
})

function onCancel() {
  emit('update:modelValue', false)
}

async function onSave() {
  if (!form.title.trim()) {
    error.value = 'Title is required'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = {
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      tags: form.tagIds,
    }
    let saved
    if (isEdit.value) {
      saved = await tasksApi.update(props.task.id, payload)
    } else {
      saved = await tasksApi.create(payload)
    }
    emit('saved', saved)
    emit('update:modelValue', false)
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Failed to save task'
  } finally {
    saving.value = false
  }
}
</script>
