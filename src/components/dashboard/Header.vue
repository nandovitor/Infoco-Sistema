
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { getUserInitials } from '@/lib/utils';
import { LogOut, User, ChevronDown, Building, LayoutDashboard, Megaphone, Database, Users, ListChecks, Mail, DollarSign, NotebookText, Handshake, ClipboardList, Archive, Landmark, BarChart2, UsersRound, Settings } from 'lucide-vue-next';
import Dropdown from '@/components/ui/Dropdown.vue';
import DropdownItem from '@/components/ui/DropdownItem.vue';
import ProfileModal from '@/components/dashboard/ProfileModal.vue';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  route?: string;
  permission: string;
  subItems?: NavItem[];
}

const authStore = useAuthStore();
const dataStore = useDataStore();
const router = useRouter();
const route = useRoute();

const user = computed(() => authStore.user);
const userPermissions = computed(() => user.value ? dataStore.permissions[user.value.role] : null);

const isProfileModalOpen = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/', permission: 'canViewDashboard' },
  { id: 'updates-feed', label: 'Notas de Atualização', icon: Megaphone, route: '/updates-feed', permission: 'canViewDashboard' },
  {
    id: 'management',
    label: 'Gerenciamento',
    icon: Building,
    permission: 'canManageDocuments',
    subItems: [
      { id: 'database', label: 'Base de Dados', icon: Database, route: '/database', permission: 'canManageDocuments' },
      { id: 'municipalities', label: 'Municípios', icon: Landmark, route: '/municipalities', permission: 'canManageFinance' },
      { id: 'employees', label: 'Funcionários', icon: Users, route: '/employees', permission: 'canManageEmployees' },
      { id: 'tasks', label: 'Tarefas', icon: ListChecks, route: '/tasks', permission: 'canManageTasks' },
    ]
  },
  {
    id: 'operations',
    label: 'Operacional',
    icon: DollarSign,
    permission: 'canManageFinance',
    subItems: [
        { id: 'finance', label: 'Financeiro', icon: DollarSign, route: '/finance', permission: 'canManageFinance' },
        { id: 'notes', label: 'Gestão de Notas', icon: NotebookText, route: '/notes', permission: 'canManageNotes' },
        { id: 'hr', label: 'Recursos Humanos', icon: Handshake, route: '/hr', permission: 'canManageHR' },
        { id: 'internal-expenses', label: 'ADM Infoco', icon: ClipboardList, route: '/internal-expenses', permission: 'canManageInternalExpenses' },
        { id: 'assets', label: 'Patrimônio', icon: Archive, route: '/assets', permission: 'canManageAssets' },
    ]
  },
  { id: 'zoho-mail', label: 'ZOHO Mail', icon: Mail, route: '/zoho-mail', permission: 'canManageEmail' },
  { id: 'reports', label: 'Relatórios', icon: BarChart2, route: '/reports', permission: 'canViewReports' },
  {
    id: 'admin',
    label: 'Administração',
    icon: Settings,
    permission: 'canManageUsers',
     subItems: [
      { id: 'users', label: 'Usuários', icon: UsersRound, route: '/users', permission: 'canManageUsers' },
      { id: 'settings', label: 'Configurações', icon: Settings, route: '/settings', permission: 'canManageSettings' },
    ]
  }
];

const hasPermission = (permissionKey: string) => {
    if (!userPermissions.value || !permissionKey) return false;
    return (userPermissions.value as any)[permissionKey];
}

const filteredNavItems = computed(() => {
    return navItems.filter(item => {
        if(item.subItems) {
            item.subItems = item.subItems.filter(sub => hasPermission(sub.permission));
            return item.subItems.length > 0;
        }
        return hasPermission(item.permission);
    });
});

</script>

<template>
  <header class="bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-md p-4 flex justify-between items-center shrink-0 z-10">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-3">
        <Building :size="28" class="text-blue-400" />
        <h1 class="text-2xl font-bold">INFOCO</h1>
      </div>
      <nav class="hidden md:flex items-center gap-2">
        <template v-for="item in filteredNavItems" :key="item.id">
            <!-- Item com Dropdown -->
            <div v-if="item.subItems && item.subItems.length" class="relative">
                <Dropdown :text="item.label">
                    <template #buttonContent>
                        <component :is="item.icon" class="mr-2 h-5 w-5" />
                        <span>{{ item.label }}</span>
                        <ChevronDown class="ml-1 h-4 w-4" />
                    </template>
                    <DropdownItem v-for="subItem in item.subItems" :key="subItem.id" @click="router.push(subItem.route!)">
                         <component :is="subItem.icon" class="mr-3 h-5 w-5" />
                        <span>{{ subItem.label }}</span>
                    </DropdownItem>
                </Dropdown>
            </div>
            <!-- Item Simples -->
            <RouterLink v-else :to="item.route!"
                custom
                v-slot="{ href, navigate, isActive }"
                >
                <a :href="href" @click="navigate"
                class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                :class="isActive ? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'">
                    <component :is="item.icon" class="mr-2 h-5 w-5" />
                    <span>{{ item.label }}</span>
                </a>
            </RouterLink>
        </template>
      </nav>
    </div>

    <div class="flex items-center gap-4">
      <!-- User Dropdown -->
      <div class="relative">
        <Dropdown text="User Menu">
            <template #buttonContent>
                 <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                    <img v-if="user?.pfp" :src="user.pfp" alt="User profile" class="w-full h-full object-cover" />
                    <span v-else>{{ user ? getUserInitials(user.name) : 'U' }}</span>
                </div>
                <div class="hidden lg:block text-left ml-3">
                    <p class="font-semibold text-sm text-white truncate max-w-40">{{ user?.name }}</p>
                    <p class="text-xs text-gray-300 truncate max-w-40">{{ user?.email }}</p>
                </div>
                <ChevronDown class="text-gray-300 ml-2 hidden sm:block" :size="20" />
            </template>

            <DropdownItem @click="isProfileModalOpen = true">
                <User class="mr-2 h-4 w-4" />
                <span>Alterar Foto</span>
            </DropdownItem>
            <DropdownItem @click="handleLogout">
                <LogOut class="mr-2 h-4 w-4 text-red-500" />
                <span class="text-red-500">Sair</span>
            </DropdownItem>
        </Dropdown>
      </div>
    </div>
  </header>
  <ProfileModal :is-open="isProfileModalOpen" @close="isProfileModalOpen = false" />
</template>