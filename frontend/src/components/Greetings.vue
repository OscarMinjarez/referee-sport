<template>
    <div class="card">
        <div class="card-body position-relative p-4">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                    <div>
                        <h6 class="card-subtitle mb-2 text-muted">Bienvenido de nuevo,</h6>
                        <h2 class="card-title mb-0">{{ userName }} 👋</h2>
                    </div>
                </div>

                <div class="icon-container">
                    <i class="fas fa-user-cog fs-1 text-secondary"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const userName = ref('Admin');

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.username) {
    userName.value = user.username;
  }
});

</script>

<style scoped>
.icon-container {
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
}

.vr {
    height: 50px;
    opacity: 0.2;
}
</style>
