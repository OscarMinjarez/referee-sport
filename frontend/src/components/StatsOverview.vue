<template>
    <div class="card">
        <div class="card-body position-relative p-4">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                    <div class="text-center">
                        <h6 class="card-subtitle mb-2 text-muted">Ventas Hoy</h6>
                        <h2 class="card-title mb-0">$4,250</h2>
                    </div>
                
                <div class="vr"></div>
                
                <div class="text-center">
                    <span class="badge bg-light text-dark fs-6 p-2">
                        <i class="fas fa-arrow-up text-success me-1"></i>
                        12% vs ayer
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