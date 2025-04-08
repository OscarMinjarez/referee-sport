<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-body-tertiary px-3">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">
          <img
              id="logo"
              src="../assets/referee-logo.svg"
              class="d-inline-block align-text-top"/>
        </a>

        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/">Inicio</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/app/catalog">Catálogo</a>
            </li>
          </ul>

          <form class="d-flex" role="search" @submit.prevent="search">
            <input
              class="form-control me-2"
              type="search"
              placeholder="Buscar"
              aria-label="Buscar"
              v-model="searchQuery">
            <button class="btn btn-outline-success" type="button" @click="search">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from "vue";

const searchQuery = ref("");

const emit = defineEmits([
    "searchProduct"
]);

function search() {
  if (searchQuery.value.trim()) {
    emit("searchProduct", searchQuery.value);
  }
}
</script>

<style scoped>
nav {
  min-height: 72px;
}

#logo {
  min-height: 50px;
  aspect-ratio: 1;
}
</style>
