<template>
  <div class="main-content d-flex h-full">
    <Sidebar class="sidebar p-3 d-flex h-full flex-column gap-2 border justify-content-between">
      <div>
        <div class="card p-2">
          <div class="img-circle-container">
            <img
                class="img-circle"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/TWICE_Jeongyeon_VETERAN_2_September_2024.jpg/640px-TWICE_Jeongyeon_VETERAN_2_September_2024.jpg"/>
          </div>
          <div class="card-body text-center fw-bold">
            <p class="card-text">Oscar Minjarez</p>
          </div>
        </div>

        <div class="mt-5">
          <ListGroup>
            <ListGroupItem label="Órdenes" icon="fa-solid fa-bag-shopping" />
<!--            <ListGroupItem label="Clientes" icon="fa-solid fa-user-tag" />-->
            <ListGroupItem label="Productos" icon="fa-solid fa-box" />
          </ListGroup>
        </div>
      </div>

      <div>
        <ListGroup>
          <ListGroupItem label="Cerrar sesión" icon="fa-solid fa-right-from-bracket" />
        </ListGroup>
      </div>
    </Sidebar>
  </div>
</template>

<script setup>
import Sidebar from "../../components/Sidebar.vue";
import ListGroup from "../../components/ListGroup.vue";
import ListGroupItem from "../../components/ListGroupItem.vue";
</script>

<style scoped>
.main-content {
  width: 100vw;
  height: 100vh;
}

.sidebar {
  width: 250px;
}

.img-circle-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
}

.img-circle {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>