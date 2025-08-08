
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
    Employee, Task, FinanceData, Permissions, EmployeeExpense, InternalExpense, Asset, ManagedFile,
    PaymentNote, Notification, Supplier, Transaction, PayrollRecord, LeaveRequest, MaintenanceRecord,
    UpdatePost, ExternalSystem, NewsArticle, GroundingSource, Profile
} from '../types';
import { handleApiResponse } from '../lib/utils';
import { DEFAULT_PERMISSIONS, DEFAULT_NOTIFICATIONS } from '../constants';

interface AppData {
    employees: Employee[];
    tasks: Task[];
    financeData: FinanceData[];
    permissions: Permissions;
    employeeExpenses: EmployeeExpense[];
    internalExpenses: InternalExpense[];
    assets: Asset[];
    managedFiles: ManagedFile[];
    paymentNotes: PaymentNote[];
    notifications: Notification[];
    suppliers: Supplier[];
    transactions: Transaction[];
    payrolls: PayrollRecord[];
    leaveRequests: LeaveRequest[];
    profiles: Profile[];
    updatePosts: UpdatePost[];
    externalSystems: ExternalSystem[];
    loginScreenImageUrl: string | null;
}

const initialData: AppData = {
    employees: [], tasks: [], financeData: [], permissions: DEFAULT_PERMISSIONS, employeeExpenses: [], internalExpenses: [], assets: [],
    managedFiles: [], paymentNotes: [], notifications: DEFAULT_NOTIFICATIONS, suppliers: [], transactions: [], payrolls: [], leaveRequests: [],
    profiles: [], updatePosts: [], externalSystems: [], loginScreenImageUrl: null,
};


export const useDataStore = defineStore('data', () => {
    // --- State ---
    const data = ref<AppData>(JSON.parse(JSON.stringify(initialData)));
    const isLoading = ref(true);
    const news = ref<string>('');
    const newsSources = ref<GroundingSource[]>([]);
    const isNewsLoading = ref(false);
    const newsError = ref<string | null>(null);

    // --- Getters (Computed) ---
    const employees = computed(() => data.value.employees);
    const tasks = computed(() => data.value.tasks);
    const financeData = computed(() => data.value.financeData);
    const permissions = computed(() => data.value.permissions);
    const profiles = computed(() => data.value.profiles);
    const loginScreenImageUrl = computed(() => data.value.loginScreenImageUrl);
    const updatePosts = computed(() => data.value.updatePosts);

    // --- Actions ---
    async function apiRequest(method: 'GET' | 'POST' | 'DELETE', entity: string, action?: string, payload?: any) {
        const url = `/api/router?entity=${entity}${action ? `&action=${action}` : ''}`;
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (payload) {
            options.body = JSON.stringify(payload);
        }
        const response = await fetch(url, options);
        return handleApiResponse<any>(response);
    }

    async function fetchData() {
        isLoading.value = true;
        try {
            const fetchedData = await apiRequest('GET', 'allData');
            data.value = { ...initialData, ...fetchedData };
        } catch (err) {
            console.error("Falha ao buscar dados iniciais:", err);
            clearData();
        } finally {
            isLoading.value = false;
        }
    }

    function clearData() {
        data.value = JSON.parse(JSON.stringify(initialData));
    }
    
    async function updateUser(user: Profile) {
      try {
        const { data: updatedProfiles } = await apiRequest('POST', 'profiles', 'update', user);
        data.value.profiles = updatedProfiles;
        return true;
      } catch(e) {
        console.error(e);
        return false;
      }
    }
    
    async function fetchNews() {
        isNewsLoading.value = true;
        newsError.value = null;
        try {
            const response = await apiRequest('GET', 'gemini', 'news');
            news.value = response.news;
            newsSources.value = response.sources;
        } catch (err: any) {
            newsError.value = err.message || 'Falha ao buscar notícias.';
        } finally {
            isNewsLoading.value = false;
        }
    }

    async function analyzeWithGemini(prompt: string): Promise<string> {
        const response = await apiRequest('POST', 'gemini', 'analyze', { prompt });
        return response.response;
    }


    return {
        // State
        data,
        isLoading,
        news,
        newsSources,
        isNewsLoading,
        newsError,

        // Getters
        employees,
        tasks,
        financeData,
        permissions,
        profiles,
        loginScreenImageUrl,
        updatePosts,

        // Actions
        fetchData,
        clearData,
        updateUser,
        fetchNews,
        analyzeWithGemini
    };
});