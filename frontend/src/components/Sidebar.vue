<template>
  <nav>
    <div>
        <div class="card p-2">
          <div class="img-circle-container">
            <img
                class="img-circle"
                :src="imgPath"/>
          </div>
          <div class="card-body text-center fw-bold">
            <p class="card-text">{{ username }}</p>
          </div>
        </div>

        <div class="mt-5">
          <ListGroup>
            <ListGroupItem label="Panel" icon="fa-solid fa-chart-line"/>
            <ListGroupItem label="Órdenes" icon="fa-solid fa-bag-shopping"/>
            <ListGroupItem label="Productos" icon="fa-solid fa-box" @click="goToStorage" />
            <ListGroupItem label="Clientes" icon="fa-solid fa-user-tag" />
          </ListGroup>
        </div>
      </div>

      <div>
        <ListGroup>
          <ListGroupItem @click="logout" label="Cerrar sesión" icon="fa-solid fa-right-from-bracket" />
        </ListGroup>
      </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import ListGroupItem from './ListGroupItem.vue';
import ListGroup from './ListGroup.vue';
import { onMounted } from 'vue';
import { ref } from 'vue';

const router = useRouter();
const username = ref("");

const imgPath = ref("");

function logout() {
  window.localStorage.clear("token");
  window.localStorage.clear("user");
  router.push("/app/login");
}

function goToStorage() {
  router.push("/app/storage");
}

onMounted(function() {
  const parseUser = JSON.parse(window.localStorage.getItem("user"));
  username.value = parseUser.username;
  imgPath.value = parseUser.imagePath ?? "../../public/defaultIcon.jpg";
});
</script>

<style scoped>
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