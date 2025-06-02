<template>
    <div class="d-flex flex-column w-100 mt-5 border rounded p-3">
        <div class="d-flex justify-content-between gap-3">
            <div class="input-group mb-3 w-50">
                <span class="input-group-text" id="basic-addon1">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Buscar venta"
                    v-model="searchQuery"
                    @input="filterSales"
                >
            </div>

            <div>
                <button 
                    type="button" 
                    class="btn btn-primary" 
                    @click="goToCreateSale"
                    v-if="canCreate"
                >
                    <i class="fas fa-plus me-2"></i>
                    Nueva venta
                </button>
            </div>
        </div>

        <Table class="text-center border">
            <thead>
                <tr>
                    <th scope="col"># Venta</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Productos</th>
                    <th scope="col">Total</th>
                    <th scope="col">Pagado</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Vendedor</th>
                    <th scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr class="align-middle" v-for="(sale, index) in filteredSales" :key="sale.uuid">
                    <td>{{ sale.numberOrder }}</td>
                    <td>
                        <div class="text-start">
                            {{ sale.customer.name }} {{ sale.customer.lastName }}
                            <div class="small text-muted">{{ sale.customer.phoneNumber }}</div>
                        </div>
                    </td>
                    <td>
                        <div class="product-preview">
                            <span v-for="(item, i) in sale.orderItems.slice(0, 2)" :key="i" class="badge bg-light text-dark me-1">
                                {{ item.product.name }} ({{ item.quantity }})
                            </span>
                            <span v-if="sale.orderItems.length > 2" class="badge bg-secondary">
                                +{{ sale.orderItems.length - 2 }} más
                            </span>
                        </div>
                    </td>
                    <td>${{ formatCurrency(sale.total) }}</td>
                    <td>
                        <span :class="getPaymentClass(sale)">
                            ${{ formatCurrency(getAmountPaid(sale)) }}
                        </span>
                    </td>
                    <td>
                        <span :class="getStatusClass(sale.state)">
                            {{
                                sale.state === 'pending' ? 'Pendiente' :
                                sale.state === 'canceled' ? 'Cancelada' :
                                sale.state === 'finished' ? 'Completada' :
                                sale.state
                            }}
                        </span>
                    </td>
                    <td>{{ formatDate(sale.date) }}</td>
                    <td>
                        <span v-if="sale.historyOrders.length > 0">
                            {{ sale.historyOrders[0].employee.username }}
                        </span>
                    </td>
                    <td>
                        <button 
                            type="button" 
                            class="btn btn-info mx-1" 
                            @click="viewSaleDetails(sale.uuid)"
                            title="Ver detalles"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button 
                            type="button" 
                            class="btn btn-warning mx-1" 
                            @click="editSale(sale.uuid)"
                            title="Editar"
                            v-if="canEdit"
                        >
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                            type="button" 
                            class="btn btn-danger mx-1" 
                            @click="cancelSale(sale.uuid)"
                            title="Cancelar"
                            v-if="canCancel(sale)"
                        >
                            <i class="fa-solid fa-ban"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </Table>

        <!-- Paginación -->
        <!-- <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="text-muted">
                Mostrando {{ filteredSales.length }} de {{ sales.length }} ventas
            </div>
            <nav>
                <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button class="page-link" @click="currentPage--">Anterior</button>
                    </li>
                    <li 
                        v-for="page in totalPages" 
                        :key="page"
                        class="page-item" 
                        :class="{ active: currentPage === page }"
                    >
                        <button class="page-link" @click="currentPage = page">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <button class="page-link" @click="currentPage++">Siguiente</button>
                    </li>
                </ul>
            </nav>
        </div> -->
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Table from './Table.vue';
import { EMPLOYEES_API } from '../constants';

const emit = defineEmits(['updateMetrics']);

const router = useRouter();
const sales = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const userRole = ref('sales');
const canCreate = computed(() => ['admin', 'sales'].includes(userRole.value));
const canEdit = computed(() => ['admin', 'sales'].includes(userRole.value));

const filteredSales = computed(() => {
    let result = sales.value.filter(sale => sale.state !== 'canceled');
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(sale => 
            sale.numberOrder.toString().includes(query) ||
            sale.customer.name.toLowerCase().includes(query) ||
            sale.customer.lastName.toLowerCase().includes(query) ||
            sale.customer.phoneNumber.includes(query) ||
            sale.orderItems.some(item => item.product.name.toLowerCase().includes(query))
        );
    }
    const start = (currentPage.value - 1) * itemsPerPage;
    return result.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(sales.value.length / itemsPerPage));

function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'decimal', 
        minimumFractionDigits: 2 
    }).format(value);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
}

function getAmountPaid(sale) {
    return sale.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
}

function getPaymentClass(sale) {
    const paid = getAmountPaid(sale);
    if (paid >= sale.total) return 'text-success fw-bold';
    if (paid > 0) return 'text-warning fw-bold';
    return 'text-danger fw-bold';
}

function getStatusClass(status) {
    return {
        'badge bg-success': status === 'finished',
        'badge bg-warning text-dark': status === 'pending',
        'badge bg-danger': status === 'canceled'
    }[status] || 'badge bg-secondary';
}

function canCancel(sale) {
    return ['admin', 'sales'].includes(userRole.value) && sale.state === 'pending';
}

function viewSaleDetails(saleUuid) {
    router.push(`/app/sales/order/${saleUuid}`);
}

function editSale(saleUuid) {
    router.push(`/app/create/${saleUuid}`);
}

function goToCreateSale() {
    router.push("/app/create")
}

onMounted(async () => {
    try {
        const response = await fetch(`${EMPLOYEES_API}/orders`);
        if (!response.ok) throw new Error("Error al obtener ventas");
        sales.value = await response.json();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) userRole.value = user.type;
        const today = new Date().toLocaleDateString('en-CA');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
        const salesToday = sales.value.filter(sale =>
            new Date(sale.date).toLocaleDateString('en-CA') === today &&
            sale.state !== 'canceled'
        );
        const totalPaidToday = salesToday.reduce((sum, sale) => {
            return sum + sale.payments.reduce((paidSum, payment) => paidSum + payment.amountPaid, 0);
        }, 0);

        const salesYesterday = sales.value.filter(sale =>
            new Date(sale.date).toLocaleDateString('en-CA') === yesterday &&
            sale.state !== 'canceled'
        );
        const totalPaidYesterday = salesYesterday.reduce((sum, sale) => {
            return sum + sale.payments.reduce((paidSum, payment) => paidSum + payment.amountPaid, 0);
        }, 0);

        const percentageChange = totalPaidYesterday === 0
            ? 100
            : ((totalPaidToday - totalPaidYesterday) / totalPaidYesterday) * 100;

        emit('updateMetrics', {
            todaySalesTotal: totalPaidToday,
            percentageChange: Math.round(percentageChange),
        });
    } catch (error) {
        console.error("Error al cargar ventas:", error);
        alert("Error al cargar las ventas");
    }
});
</script>

<style scoped>
.product-preview {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badge {
    font-weight: normal;
    margin-bottom: 2px;
}
</style>