<template>
  <v-row justify="center" class="mt-10">
    <v-col cols="12" md="6" class="text-center">
      <v-icon icon="mdi-alert-octagon-outline" size="80" color="grey" />
      <h1 class="text-h3 mt-3">404</h1>
      <p class="text-h6 text-medium-emphasis mb-4">
        The page you requested does not exist.
      </p>
      <v-btn color="primary" :to="{ name: 'tasks' }" prepend-icon="mdi-home">
        Back to Tasks
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup></script>
