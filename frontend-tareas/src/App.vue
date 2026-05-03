<template>
  <v-app>
    <v-app-bar color="secondary" density="comfortable">
      <v-app-bar-title>
        <v-icon icon="mdi-checkbox-marked-circle-outline" class="mr-2" />
        Todo Listo
      </v-app-bar-title>
      <template #append>
        <v-btn
          :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="toggleTheme"
        />
        <template v-if="isLoggedIn">
          <v-chip class="mx-2" prepend-icon="mdi-account-circle" variant="text" size="small">
            {{ usuario?.email }}
          </v-chip>
          <v-btn icon="mdi-logout" title="Cerrar sesión" @click="doLogout" />
        </template>
      </template>
    </v-app-bar>

    <v-main>
      <!-- Pantalla de login — visible cuando no hay sesión activa -->
      <v-container
        v-if="!isLoggedIn"
        class="d-flex align-center justify-center"
        style="min-height: calc(100vh - 48px)"
      >
        <v-card width="420" elevation="8">
          <v-card-title class="pa-6 pb-2">
            <v-icon icon="mdi-shield-lock" class="mr-2" color="primary" />
            Iniciar sesión
          </v-card-title>
          <v-card-text class="px-6">
            <v-text-field
              v-model="loginEmail"
              label="Correo electrónico"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              class="mb-2"
              @keyup.enter="doLogin"
            />
            <v-text-field
              v-model="loginApiKey"
              label="API Key"
              type="password"
              variant="outlined"
              prepend-inner-icon="mdi-key"
              @keyup.enter="doLogin"
            />
            <v-alert
              v-if="loginError"
              type="error"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              {{ loginError }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="px-6 pb-6">
            <v-btn
              color="primary"
              variant="flat"
              block
              :loading="loginLoading"
              @click="doLogin"
            >
              Iniciar sesión
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>

      <!-- App principal — visible cuando hay sesión activa -->
      <v-container v-else class="py-6" style="max-width: 720px">
        <!-- Barra de búsqueda y botón agregar -->
        <v-row class="mb-4" align="center">
          <v-col>
            <v-text-field
              v-model="busqueda"
              prepend-inner-icon="mdi-magnify"
              label="Buscar tareas..."
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="onBuscar"
              @click:clear="cargarTareas"
            />
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="abrirDialogoCrear"
            >
              Nueva
            </v-btn>
          </v-col>
        </v-row>

        <!-- Stats -->
        <v-row class="mb-4">
          <v-col cols="4">
            <v-card variant="tonal" color="info" class="text-center pa-3">
              <div class="text-h5">{{ tareas.length }}</div>
              <div class="text-caption">Total</div>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card variant="tonal" color="success" class="text-center pa-3">
              <div class="text-h5">{{ completadas }}</div>
              <div class="text-caption">Completadas</div>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card variant="tonal" color="warning" class="text-center pa-3">
              <div class="text-h5">{{ pendientes }}</div>
              <div class="text-caption">Pendientes</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Progreso -->
        <v-progress-linear
          v-if="tareas.length"
          :model-value="progreso"
          color="primary"
          height="8"
          rounded
          class="mb-4"
        />

        <!-- Loading -->
        <div v-if="cargando" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Lista vacía -->
        <v-card v-else-if="!tareas.length" variant="outlined" class="text-center pa-8">
          <v-icon icon="mdi-clipboard-text-outline" size="64" color="grey" />
          <div class="text-h6 mt-4 text-grey">
            {{ busqueda ? 'Sin resultados' : 'No hay tareas aún' }}
          </div>
          <v-btn
            v-if="!busqueda"
            color="primary"
            variant="text"
            class="mt-2"
            @click="abrirDialogoCrear"
          >
            Crear primera tarea
          </v-btn>
        </v-card>

        <!-- Lista de tareas -->
        <v-card v-else variant="outlined">
          <v-list lines="two">
            <template v-for="(tarea, i) in tareas" :key="tarea.id">
              <v-list-item>
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="tarea.completada"
                    color="primary"
                    @update:model-value="toggleCompletada(tarea)"
                  />
                </template>

                <v-list-item-title
                  :class="{ 'text-decoration-line-through text-grey': tarea.completada }"
                >
                  {{ tarea.titulo }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  ID: {{ tarea.id }} ·
                  <v-chip
                    :color="tarea.completada ? 'success' : 'warning'"
                    size="x-small"
                    label
                  >
                    {{ tarea.completada ? 'Completada' : 'Pendiente' }}
                  </v-chip>
                </v-list-item-subtitle>

                <template #append>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    color="info"
                    @click="abrirDialogoEditar(tarea)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="confirmarEliminar(tarea)"
                  />
                </template>
              </v-list-item>
              <v-divider v-if="i < tareas.length - 1" />
            </template>
          </v-list>
        </v-card>

        <!-- Diálogo crear/editar -->
        <v-dialog v-model="dialogo" max-width="480" persistent>
          <v-card>
            <v-card-title>
              <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus-circle'" class="mr-2" />
              {{ editando ? 'Editar tarea' : 'Nueva tarea' }}
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="form.titulo"
                label="Título"
                variant="outlined"
                :error-messages="formError"
                autofocus
                @keyup.enter="guardar"
              />
              <v-switch
                v-model="form.completada"
                label="Completada"
                color="primary"
                hide-details
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="dialogo = false">Cancelar</v-btn>
              <v-btn
                color="primary"
                variant="flat"
                :loading="guardando"
                @click="guardar"
              >
                {{ editando ? 'Actualizar' : 'Crear' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Diálogo confirmar eliminar -->
        <v-dialog v-model="dialogoEliminar" max-width="400">
          <v-card>
            <v-card-title class="text-error">
              <v-icon icon="mdi-alert-circle" class="mr-2" />
              Eliminar tarea
            </v-card-title>
            <v-card-text>
              ¿Eliminar <strong>"{{ tareaEliminar?.titulo }}"</strong>?
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="dialogoEliminar = false">Cancelar</v-btn>
              <v-btn
                color="error"
                variant="flat"
                :loading="eliminando"
                @click="eliminarTarea"
              >
                Eliminar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :color="snackColor" :timeout="2500" location="bottom end">
          {{ snackMsg }}
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import * as api     from './services/tareas.api.js'
import * as authApi from './services/auth.api.js'

const vuetifyTheme = useTheme()
const theme = ref('dark')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  vuetifyTheme.global.name.value = theme.value
}

// ─── Auth ────────────────────────────────────────────────────────────────────
const csrfToken    = ref('')
const usuario      = ref(null)
const isLoggedIn   = computed(() => !!csrfToken.value && !!usuario.value)

const loginEmail   = ref('')
const loginApiKey  = ref('')
const loginError   = ref('')
const loginLoading = ref(false)

async function restoreSession() {
  const cookieCsrf = authApi.getCsrfFromCookie()
  if (!cookieCsrf) return
  try {
    const data      = await authApi.verifyAuth()
    csrfToken.value = data.csrfToken
    usuario.value   = data.usuario
  } catch {
    csrfToken.value = ''
    usuario.value   = null
  }
}

async function doLogin() {
  loginError.value   = ''
  loginLoading.value = true
  try {
    const data      = await authApi.login(loginEmail.value.trim(), loginApiKey.value.trim())
    csrfToken.value = data.csrfToken
    usuario.value   = data.usuario
    await cargarTareas()
  } catch (err) {
    loginError.value = err.message
  } finally {
    loginLoading.value = false
  }
}

async function doLogout() {
  try { await authApi.logout(csrfToken.value) } finally {
    csrfToken.value = ''
    usuario.value   = null
    tareas.value    = []
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// Estado
const tareas = ref([])
const cargando = ref(false)
const busqueda = ref('')

// Formulario
const dialogo = ref(false)
const editando = ref(null)
const form = ref({ titulo: '', completada: false })
const formError = ref('')
const guardando = ref(false)

// Eliminar
const dialogoEliminar = ref(false)
const tareaEliminar = ref(null)
const eliminando = ref(false)

// Snackbar
const snackbar = ref(false)
const snackMsg = ref('')
const snackColor = ref('success')

const completadas = computed(() => tareas.value.filter(t => t.completada).length)
const pendientes = computed(() => tareas.value.filter(t => !t.completada).length)
const progreso = computed(() => tareas.value.length ? (completadas.value / tareas.value.length) * 100 : 0)

function mostrarSnack(msg, color = 'success') {
  snackMsg.value = msg
  snackColor.value = color
  snackbar.value = true
}

async function cargarTareas() {
  cargando.value = true
  try {
    const res = await api.obtenerTodas()
    if (res.success) tareas.value = res.data
  } catch {
    mostrarSnack('Error al cargar tareas', 'error')
  } finally {
    cargando.value = false
  }
}

let debounceTimer = null
function onBuscar(valor) {
  clearTimeout(debounceTimer)
  if (!valor) {
    cargarTareas()
    return
  }
  debounceTimer = setTimeout(async () => {
    cargando.value = true
    try {
      const res = await api.buscar(valor)
      if (res.success) tareas.value = res.data
    } catch {
      mostrarSnack('Error en la búsqueda', 'error')
    } finally {
      cargando.value = false
    }
  }, 300)
}

function abrirDialogoCrear() {
  editando.value = null
  form.value = { titulo: '', completada: false }
  formError.value = ''
  dialogo.value = true
}

function abrirDialogoEditar(tarea) {
  editando.value = tarea.id
  form.value = { titulo: tarea.titulo, completada: tarea.completada }
  formError.value = ''
  dialogo.value = true
}

async function guardar() {
  if (!form.value.titulo.trim()) {
    formError.value = 'El título es requerido'
    return
  }
  formError.value = ''
  guardando.value = true
  try {
    if (editando.value) {
      const res = await api.actualizarCompleta(editando.value, form.value, csrfToken.value)
      if (res.success) {
        mostrarSnack('Tarea actualizada')
      } else {
        mostrarSnack(res.message || 'Error al actualizar', 'error')
      }
    } else {
      const res = await api.crear(form.value, csrfToken.value)
      if (res.success) {
        mostrarSnack('Tarea creada')
      } else {
        mostrarSnack(res.message || 'Error al crear', 'error')
      }
    }
    dialogo.value = false
    busqueda.value = ''
    await cargarTareas()
  } catch {
    mostrarSnack('Error de conexión', 'error')
  } finally {
    guardando.value = false
  }
}

async function toggleCompletada(tarea) {
  try {
    const res = await api.actualizarParcial(tarea.id, { completada: !tarea.completada }, csrfToken.value)
    if (res.success) {
      tarea.completada = !tarea.completada
    }
  } catch {
    mostrarSnack('Error al actualizar', 'error')
  }
}

function confirmarEliminar(tarea) {
  tareaEliminar.value = tarea
  dialogoEliminar.value = true
}

async function eliminarTarea() {
  eliminando.value = true
  try {
    const res = await api.eliminar(tareaEliminar.value.id, csrfToken.value)
    if (res.success) {
      mostrarSnack('Tarea eliminada')
      dialogoEliminar.value = false
      busqueda.value = ''
      await cargarTareas()
    } else {
      mostrarSnack(res.message || 'Error al eliminar', 'error')
    }
  } catch {
    mostrarSnack('Error de conexión', 'error')
  } finally {
    eliminando.value = false
  }
}

onMounted(async () => {
  await restoreSession()
  if (isLoggedIn.value) await cargarTareas()
})
</script>
