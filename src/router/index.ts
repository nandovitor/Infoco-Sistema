
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/views/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/dashboard/DashboardHome.vue') },
        { path: 'updates-feed', name: 'updates-feed', component: () => import('@/views/dashboard/UpdatesFeed.vue') },
        { path: 'database', name: 'database', component: () => import('@/views/dashboard/DatabaseView.vue') },
        { path: 'employees', name: 'employees', component: () => import('@/views/dashboard/EmployeesView.vue') },
        { path: 'tasks', name: 'tasks', component: () => import('@/views/dashboard/TasksView.vue') },
        { path: 'zoho-mail', name: 'zoho-mail', component: () => import('@/views/dashboard/ZohoMailView.vue') },
        { path: 'finance', name: 'finance', component: () => import('@/views/dashboard/FinanceView.vue') },
        { path: 'notes', name: 'notes', component: () => import('@/views/dashboard/NotesView.vue') },
        { path: 'hr', name: 'hr', component: () => import('@/views/dashboard/HumanResourcesView.vue') },
        { path: 'internal-expenses', name: 'internal-expenses', component: () => import('@/views/dashboard/InternalExpensesView.vue') },
        { path: 'assets', name: 'assets', component: () => import('@/views/dashboard/AssetsView.vue') },
        { path: 'municipalities', name: 'municipalities', component: () => import('@/views/dashboard/MunicipalitiesView.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/views/dashboard/ReportsView.vue') },
        { path: 'users', name: 'users', component: () => import('@/views/dashboard/UsersView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/dashboard/SettingsView.vue') },
        {
          path: 'zoho-callback',
          name: 'zoho-callback',
          component: () => import('@/components/auth/ZohoCallbackHandler.vue'),
        },
      ]
    },
    // Redireciona para o login se a rota não for encontrada
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Garante que a verificação da sessão foi concluída
  if (authStore.isAuthLoading) {
    await authStore.checkSession();
  }

  const isAuthenticated = !!authStore.user;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
})

export default router
