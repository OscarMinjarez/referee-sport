import { createWebHistory, createRouter } from "vue-router";

import CatalogView from "./views/clients/CatalogView.vue";
import ProductDetailsView from './views/clients/ProductDetailsView.vue';
import StorageView from "./views/storage/StorageView.vue";
import UploadProductView from "./views/storage/UploadProductView.vue";

import App from "./App.vue";
import SaleView from "./views/sales/SaleView.vue";
import CreateOrderView from "./views/sales/CreateOrderView.vue";
import OrderDetails from "./views/sales/OrderDetails.vue";
import LoginView from "./views/auths/LoginView.vue";

import UnauthorizedView from "./views/auths/UnauthorizedView.vue";
import DashboardView from "./views/admin/DashboardView.vue";
import EmployeesView from "./views/employees/EmployeesView.vue";
import CreateEmployee from "./views/employees/CreateEmployee.vue";

const routes = [
    {
        path: "/",
        redirect: "/app/catalog",
    },
    {
        path: "/app",
        component: App,
        children: [
            // Rutas públicas/autenticación
            {
                path: "login",
                name: "login",
                component: LoginView
            },
            
            // Rutas para clientes (acceso público)
            {
                path: "catalog",
                name: "catalog",
                component: CatalogView,
                meta: { for: 'client' }
            },
            {
                path: "details/:id",
                name: "details",
                component: ProductDetailsView,
                meta: { for: 'client' }
            },

            // Rutas para personal de almacén
            {
                path: "storage",
                name: "storage",
                component: StorageView,
                meta: { requiresAuth: true, roles: ['store', 'sales'] }
            },
            {
                path: "upload/:id?",
                name: "upload",
                component: UploadProductView,
                meta: { requiresAuth: true, roles: ['store', 'admin'] }
            },

            // Rutas para personal de ventas
            {
                path: "sales",
                name: "sales",
                component: SaleView,
                meta: { requiresAuth: true, roles: ['sales', 'store', 'admin'] }
            },
            {
                path: "sales/order/:id",
                name: "order",
                component: OrderDetails,
                meta: { requiresAuth: true, roles: ['sales', 'store', 'admin'] }
            },
            {
                path: "create/:id?",
                name: "create",
                component: CreateOrderView,
                meta: { requiresAuth: true, roles: ['sales'] }
            },

            // Rutas para administradores
            {
                path: "dashboard",
                name: "dashboard",
                component: DashboardView,
                meta: { requiresAuth: true, roles: ['admin'] }
            },
            {
                path: "employees",
                name: "employees",
                component: EmployeesView,
                meta: { requiresAuth: true, roles: ["admin"] }
            },
            {
                path: "create-employee/:id?",
                name: "create-employee",
                component: CreateEmployee,
                meta: { requiresAuth: true, roles: ["admin"] }
            },
            {
                path: "unauthorized",
                name: "unauthorized",
                component: UnauthorizedView
            }
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    let userData = {};
    try {
        const user = localStorage.getItem('user');
        userData = user ? JSON.parse(user) : {};
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
    }
    const userRole = userData.type;
    if (to.name === 'login' && isAuthenticated) {
        return next(redirectByRole(userRole));
    }
    if (isAuthenticated) {
        try {
        const isTokenValid = await verifyTokenExpiration(token);        
        if (!isTokenValid) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return next({ name: 'login', query: { redirect: to.fullPath } });
        }
        } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.clear();
        return next({ name: 'login' });
        }
    }
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            return next({ name: 'login', query: { redirect: to.fullPath } });
        }
        const requiredRoles = to.meta.roles || [];
        const hasPermission = requiredRoles.includes(userRole) || userRole === 'admin';
        if (!hasPermission) {
            return next({ name: 'unauthorized' });
        }
    }
    next();
});

function redirectByRole(role) {
    switch (role) {
        case 'admin':
            return { path: '/app/dashboard' };
        case 'store':
            return { path: '/app/storage' };
        case 'sales':
            return { path: '/app/sales' };
        default:
            return { path: '/app/catalog' };
    }
}

async function verifyTokenExpiration(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
}

export default router;
