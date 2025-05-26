<template>
    <div class="main-content d-flex">
        <Sidebar />

        <div class="d-flex m-5 content-wrapper justify-content-center flex-column">
            <div class="d-flex justify-content-between gap-4">
                <Greetings class="w-100"/>
                <StatsOverview class="w-100"/>
            </div>

            <div class="d-flex flex-row">
                <div class="content-wrapper">
                    <DashboardView class="sales-content" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Sidebar from '../../components/Sidebar.vue';
import StatsOverview from '../../components/StatsOverview.vue';
import DashboardView from "../../components/SalesTable.vue";
import Greetings from '../../components/Greetings.vue';
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

.sales-content {
    width: 100%;
    background-color: white;
    border-radius: 8px;
}
</style>