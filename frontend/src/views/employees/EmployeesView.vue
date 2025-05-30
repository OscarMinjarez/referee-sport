<template>
    <div class="main-content d-flex">
        <Sidebar />

        <div class="content-wrapper m-5">
            <EmployeesTable class="employees-content" />
        </div>
    </div>
</template>

<script setup>
import Sidebar from '../../components/Sidebar.vue';
import EmployeesTable from '../../components/EmployeesTable.vue';
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
    overflow-y: auto;
}

.employees-content {
    width: 100%;
    border-radius: 8px;
}
</style>