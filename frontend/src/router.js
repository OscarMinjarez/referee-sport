import { createWebHistory, createRouter } from "vue-router";
import App from "./App.vue";

const publicRoutes = [
  {
    path: "login",
    name: "login",
    component: () => import("./views/auths/LoginView.vue")
  },
  {
    path: "unauthorized",
    name: "unauthorized",
    component: () => import("./views/auths/UnauthorizedView.vue")
  }
];

const clientRoutes = [
    {
        path: "catalog",
        name: "catalog",
        component: () => import("./views/clients/CatalogView.vue"),
        meta: { for: 'client' }
    },
    {
        path: "details/:id",
        name: "details",
        component: () => import("./views/clients/ProductDetailsView.vue"),
        meta: { for: 'client' }
    }
];

const storageRoutes = [
    {
        path: "storage",
        name: "storage",
        component: () => import("./views/storage/StorageView.vue"),
        meta: { requiresAuth: true, roles: ['store', 'sales'] }
    },
    {
        path: "upload/:id?",
        name: "upload",
        component: () => import("./views/storage/UploadProductView.vue"),
        meta: { requiresAuth: true, roles: ['store', 'admin'] }
    }
];

const salesRoutes = [
    {
        path: "sales",
        name: "sales",
        component: () => import("./views/sales/SaleView.vue"),
        meta: { requiresAuth: true, roles: ['sales', 'store', 'admin'] }
    },
    {
        path: "sales/order/:id",
        name: "order",
        component: () => import("./views/sales/OrderDetails.vue"),
        meta: { requiresAuth: true, roles: ['sales', 'store', 'admin'] }
    },
    {
        path: "create/:id?",
        name: "create",
        component: () => import("./views/sales/CreateOrderView.vue"),
        meta: { requiresAuth: true, roles: ['sales'] }
    }
];

const adminRoutes = [
    {
        path: "dashboard",
        name: "dashboard",
        component: () => import("./views/admin/DashboardView.vue"),
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        path: "employees",
        name: "employees",
        component: () => import("./views/employees/EmployeesView.vue"),
        meta: { requiresAuth: true, roles: ["admin"] }
    },
    {
        path: "create-employee/:id?",
        name: "create-employee",
        component: () => import("./views/employees/CreateEmployee.vue"),
        meta: { requiresAuth: true, roles: ["admin"] }
    }
];

const routes = [
    {
        path: "/",
        redirect: "/app/catalog",
    },
    {
        path: "/app",
        component: App,
        children: [
            ...publicRoutes,
            ...clientRoutes,
            ...storageRoutes,
            ...salesRoutes,
            ...adminRoutes
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { top: 0 };
    }
});

router.beforeEach(async (to, from, next) => {
    const authRequired = to.matched.some(record => record.meta.requiresAuth);
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    if (isAuthenticated) {
        try {
        const isValid = await verifyTokenExpiration(token);
        if (!isValid) {
            clearAuthData();
            return redirectToLogin(to);
        }
        } catch (error) {
        console.error('Error verifying token:', error);
        clearAuthData();
        return redirectToLogin(to);
        }
    }
    if (to.name === 'login' && isAuthenticated) {
        return next(redirectByRole(getUserRole()));
    }
    if (authRequired) {
        if (!isAuthenticated) return redirectToLogin(to);
        if (!hasRequiredRole(to)) return next({ name: 'unauthorized' });
    }
    next();
});

function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function redirectToLogin(to) {
    return { 
        name: 'login', 
        query: { redirect: to.fullPath } 
    };
}

function getUserRole() {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).type : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

function hasRequiredRole(to) {
    const userRole = getUserRole();
    const requiredRoles = to.meta.roles || [];
    return requiredRoles.includes(userRole) || userRole === 'admin';
}

function redirectByRole(role) {
    const roleRoutes = {
        'admin': '/app/dashboard',
        'store': '/app/storage',
        'sales': '/app/sales',
        'default': '/app/catalog'
    };
    return { path: roleRoutes[role] || roleRoutes.default };
}

async function verifyTokenExpiration(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
        console.error('Error decoding token:', error);
        return false;
    }
}

export default router;