<template>
  <div>
    <h2 class="text-h5 mb-4 d-flex align-center">
      <v-icon icon="mdi-magnify-scan" class="mr-2" />
      Advanced Search
    </h2>

    <!-- Users by tags -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon icon="mdi-account-search" class="mr-2" />
        Users by Tags
      </v-card-title>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-combobox
              v-model="ubt.tags"
              label="Tag names"
              multiple
              chips
              clearable
              closable-chips
              hide-no-data
              data-testid="users-by-tags-input"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn-toggle v-model="ubt.mode" color="primary" mandatory divided>
              <v-btn value="and" data-testid="ubt-mode-and">AND</v-btn>
              <v-btn value="or" data-testid="ubt-mode-or">OR</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="ubt.loading"
              @click="runUsersByTags"
              data-testid="users-by-tags-go"
            >
              Search
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="ubt.error" type="error" variant="tonal" density="compact" class="mt-2">
          {{ ubt.error }}
        </v-alert>
        <v-data-table
          v-if="ubt.results.length"
          :headers="userHeaders"
          :items="ubt.results"
          density="comfortable"
          class="mt-3"
          data-testid="users-by-tags-results"
        />
        <p v-else-if="ubt.queried && !ubt.loading" class="text-caption mt-3">
          No users matched.
        </p>
      </v-card-text>
    </v-card>

    <!-- Tasks by tags -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon icon="mdi-clipboard-search-outline" class="mr-2" />
        Tasks by Tags
      </v-card-title>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-combobox
              v-model="tbt.tags"
              label="Tag names"
              multiple
              chips
              clearable
              closable-chips
              hide-no-data
              data-testid="tasks-by-tags-input"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn-toggle v-model="tbt.mode" color="primary" mandatory divided>
              <v-btn value="and" data-testid="tbt-mode-and">AND</v-btn>
              <v-btn value="or" data-testid="tbt-mode-or">OR</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="tbt.loading"
              @click="runTasksByTags"
              data-testid="tasks-by-tags-go"
            >
              Search
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="tbt.error" type="error" variant="tonal" density="compact" class="mt-2">
          {{ tbt.error }}
        </v-alert>
        <v-data-table
          v-if="tbt.results.length"
          :headers="taskHeaders"
          :items="tbt.results"
          density="comfortable"
          class="mt-3"
          data-testid="tasks-by-tags-results"
        >
          <template #item.tags="{ value }">
            <v-chip
              v-for="t in value || []"
              :key="t.id"
              size="x-small"
              color="indigo"
              variant="outlined"
              class="ma-1"
            >
              {{ t.name }}
            </v-chip>
          </template>
          <template #item.user="{ value }">
            {{ value?.username }}
          </template>
        </v-data-table>
        <p v-else-if="tbt.queried && !tbt.loading" class="text-caption mt-3">
          No tasks matched.
        </p>
      </v-card-text>
    </v-card>

    <!-- Tags by users -->
    <v-card>
      <v-card-title>
        <v-icon icon="mdi-tag-search-outline" class="mr-2" />
        Tags by Users
      </v-card-title>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-combobox
              v-model="tbu.users"
              label="Usernames"
              multiple
              chips
              clearable
              closable-chips
              hide-no-data
              data-testid="tags-by-users-input"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn-toggle v-model="tbu.mode" color="primary" mandatory divided>
              <v-btn value="and" data-testid="tbu-mode-and">AND</v-btn>
              <v-btn value="or" data-testid="tbu-mode-or">OR</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="tbu.loading"
              @click="runTagsByUsers"
              data-testid="tags-by-users-go"
            >
              Search
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="tbu.error" type="error" variant="tonal" density="compact" class="mt-2">
          {{ tbu.error }}
        </v-alert>
        <div v-if="tbu.results.length" class="mt-3" data-testid="tags-by-users-results">
          <v-chip
            v-for="t in tbu.results"
            :key="t.id || t.name"
            color="indigo"
            variant="tonal"
            class="ma-1"
          >
            {{ t.name || t }}
          </v-chip>
        </div>
        <p v-else-if="tbu.queried && !tbu.loading" class="text-caption mt-3">
          No tags matched.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import * as searchApi from '../api/search'

const userHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Username', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
]

const taskHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Status', key: 'status' },
  { title: 'Owner', key: 'user' },
  { title: 'Tags', key: 'tags', sortable: false },
]

const ubt = reactive({
  tags: [],
  mode: 'and',
  loading: false,
  error: '',
  results: [],
  queried: false,
})
const tbt = reactive({
  tags: [],
  mode: 'and',
  loading: false,
  error: '',
  results: [],
  queried: false,
})
const tbu = reactive({
  users: [],
  mode: 'and',
  loading: false,
  error: '',
  results: [],
  queried: false,
})

function errMsg(e) {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    'Search failed'
  )
}

async function runUsersByTags() {
  ubt.loading = true
  ubt.error = ''
  ubt.queried = true
  try {
    const data = await searchApi.usersByTags(ubt.tags, ubt.mode)
    ubt.results = Array.isArray(data) ? data : data.users || []
  } catch (e) {
    ubt.error = errMsg(e)
    ubt.results = []
  } finally {
    ubt.loading = false
  }
}

async function runTasksByTags() {
  tbt.loading = true
  tbt.error = ''
  tbt.queried = true
  try {
    const data = await searchApi.tasksByTags(tbt.tags, tbt.mode)
    tbt.results = Array.isArray(data) ? data : data.tasks || []
  } catch (e) {
    tbt.error = errMsg(e)
    tbt.results = []
  } finally {
    tbt.loading = false
  }
}

async function runTagsByUsers() {
  tbu.loading = true
  tbu.error = ''
  tbu.queried = true
  try {
    const data = await searchApi.tagsByUsers(tbu.users, tbu.mode)
    tbu.results = Array.isArray(data) ? data : data.tags || []
  } catch (e) {
    tbu.error = errMsg(e)
    tbu.results = []
  } finally {
    tbu.loading = false
  }
}
</script>
