<template>
    <div class="main-content d-flex">
        <Sidebar />

        <div class="content-wrapper m-5">
            <OrdersTable class="orders-content" />
        </div>
    </div>
</template>

<script setup>
import Sidebar from '../../components/Sidebar.vue';
import OrdersTable from '../../components/OrdersTable.vue';
</script>

<style scoped>
.main-content {
    width: 100vw;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    min-height: 100vh;
    position: sticky;
    top: 0;
}

.content-wrapper {
    flex: 1;
    padding-bottom: 40px;
    overflow-y: auto;
}

.orders-content {
    width: 100%;
    margin: 0 auto;
    border-radius: 8px;
}
</style>