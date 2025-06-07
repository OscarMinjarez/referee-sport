<template>
    <footer class="bg-dark text-light pt-5 pb-4 mt-5">
        <div class="container text-center">

            <div class="row gy-4 justify-content-center mb-4">

                <div class="col-12 col-md-4">
                    <h6 class="text-uppercase fw-bold mb-3">Nosotros</h6>
                    <ul class="list-unstyled small">
                        <li>{{ storeName }}</li>
                        <li>{{ storeAddress }}</li>
                        <li>RFC: {{ storeRfc }}</li>
                    </ul>
                </div>

                <div class="col-12 col-md-4">
                    <h6 class="text-uppercase fw-bold mb-3">Contacto</h6>
                    <ul class="list-unstyled small">
                        <li>{{ contactPhone }}</li>
                        <li>{{ contactEmail }}</li>
                        <li>{{ contactCity }}</li>
                    </ul>
                </div>

                <div class="col-12 col-md-4">
                    <h6 class="text-uppercase fw-bold mb-3">Redes</h6>
                    <div class="d-flex justify-content-center gap-3 fs-5">
                        <a :href="instagramUrl" target="_blank" class="text-light">
                            <i class="fa-brands fa-instagram"></i>
                        </a>
                        <a :href="facebookUrl" target="_blank" class="text-light">
                            <i class="fa-brands fa-square-facebook"></i>
                        </a>
                    </div>
                </div>
            </div>

            <hr class="border-secondary" />

            <div class="text-center small mt-3">
                <p class="mb-1">
                    Desarrollado por <strong>Oscar | Adenium</strong> — Creado en tierra árida.
                </p>
                <p class="mb-0">&copy; 2025 Adenium. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
</template>

<script setup>
const props = defineProps({
    storeName: { type: String, default: "Referee Sport" },
    storeAddress: { type: String, default: "Quintana Roo S/N, Ciudad Obregón, Sonora" },
    storeRfc: { type: String, default: "CUMJ8712185FA" },
    storeHours: { type: String, default: "Lunes a Sábado, 9:00 AM - 6:00 PM" },

    contactPhone: { type: String, default: "(644) 233 1687" },
    contactCity: { type: String, default: "Ciudad Obregón, Sonora" },

    instagramUrl: { type: String, default: "https://www.instagram.com/adenium.dev" }
});
</script>

<style scoped>
footer {
    font-size: 0.9rem;
}
</style>
