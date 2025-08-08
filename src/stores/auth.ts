
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '../types';
import { useDataStore } from './data';
import { useMailStore } from './mail';
import { handleApiResponse } from '../lib/utils';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const isAuthLoading = ref(true);

  const isAuthenticated = computed(() => !!user.value);

  async function login(email: string, pass: string) {
    isLoading.value = true;
    try {
      const response = await fetch('/api/router?entity=auth&action=login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await handleApiResponse<{ user: User }>(response);
      user.value = data.user;
      
      const dataStore = useDataStore();
      await dataStore.fetchData();
      
      router.push('/');
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await fetch('/api/router?entity=auth&action=logout', { method: 'POST' });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      user.value = null;
      useDataStore().clearData();
      useMailStore().disconnect();
      isLoading.value = false;
      await router.push('/login');
    }
  }

  async function checkSession() {
    isAuthLoading.value = true;
    try {
      const response = await fetch('/api/router?entity=auth&action=me');
      if (response.ok) {
        const data = await handleApiResponse<{ user: User }>(response);
        user.value = data.user;
        const dataStore = useDataStore();
        if(!dataStore.employees.length) {
           await dataStore.fetchData();
        }
      } else {
        user.value = null;
      }
    } catch (error) {
      console.error("Session check failed", error);
      user.value = null;
    } finally {
      isAuthLoading.value = false;
    }
  }

  async function uploadProfilePicture(file: File): Promise<string> {
    isLoading.value = true;
    try {
        const formData = new FormData();
        formData.append('pfp', file);

        const response = await fetch('/api/router?entity=profiles&action=uploadPfp', {
            method: 'POST',
            body: formData,
        });
        const data = await handleApiResponse<{ url: string }>(response);
        
        if (user.value) {
            user.value.pfp = data.url;
        }
        return data.url;
    } catch (error) {
        console.error("PFP Upload failed", error);
        throw error;
    } finally {
        isLoading.value = false;
    }
  }

  return { user, isLoading, isAuthLoading, isAuthenticated, login, logout, checkSession, uploadProfilePicture };
});