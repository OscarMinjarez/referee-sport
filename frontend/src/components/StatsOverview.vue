<template>
    <div class="card">
        <div class="card-body position-relative p-4">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                    <div class="text-center">
                        <h6 class="card-subtitle mb-2 text-muted">Ventas Hoy</h6>
                        <h2 class="card-title mb-0">${{ todaySales.toFixed(2) }}</h2>
                    </div>

                    <div class="vr"></div>

                    <div class="text-center">
                        <span
                            class="badge fs-6 p-2"
                            :class="percentageChange > 0 ? 'bg-light text-success' : 'bg-light text-danger'"
                        >
                        <i 
                            :class="{
                                'fas fa-arrow-up me-1': percentageChange > 0,
                                'fas fa-arrow-down me-1': percentageChange < 0,
                                'fas fa-minus me-1': percentageChange === 0
                            }"
                        ></i>
                            {{ Math.abs(percentageChange) }}% vs ayer
                        </span>
                    </div>
                </div>

                <div class="icon-container">
                <i class="fas fa-shopping-bag fs-1"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    todaySales: Number,
    percentageChange: Number
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