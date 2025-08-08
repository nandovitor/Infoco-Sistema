import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ZohoTokenData, ZohoAccountInfo, ZohoEmailListItem, ZohoEmail } from '../types';
import { handleApiResponse } from '../lib/utils';
import useLocalStorage from '../hooks/useLocalStorage';

async function apiRequest(entity: 'zoho', action: string, method: 'GET' | 'POST' = 'GET', options: RequestInit = {}) {
    const response = await fetch(`/api/router?entity=${entity}&action=${action}`, {
        method,
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });
    return handleApiResponse(response);
};

export const useMailStore = defineStore('mail', () => {
    // State
    const { storedValue: tokens, setValue: setTokens } = useLocalStorage<ZohoTokenData | null>('infoco_zoho_tokens', null);
    const { storedValue: accountInfo, setValue: setAccountInfo } = useLocalStorage<ZohoAccountInfo | null>('infoco_zoho_account', null);
    
    const isConnecting = ref(false);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const emails = ref<ZohoEmailListItem[]>([]);

    // Getters
    const isAuthenticated = computed(() => !!(tokens.value && tokens.value.access_token));

    // Actions
    function disconnect() {
        setTokens(null);
        setAccountInfo(null);
        error.value = null;
        emails.value = [];
    }

    async function getValidAccessToken(): Promise<string | null> {
        if (!tokens.value) {
            disconnect();
            return null;
        }

        if (Date.now() >= tokens.value.expires_at) {
            try {
                const data = await apiRequest('zoho', 'refreshToken', 'POST', {
                    body: JSON.stringify({ refresh_token: tokens.value.refresh_token }),
                }) as { access_token: string; expires_in: number };

                const newExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
                const newTokens = { ...tokens.value, access_token: data.access_token, expires_at: newExpiresAt };
                setTokens(newTokens);
                return newTokens.access_token;

            } catch (err: any) {
                error.value = `Sua sessão com o Zoho expirou. Por favor, conecte-se novamente. (Erro: ${err.message})`;
                disconnect();
                return null;
            }
        }
        return tokens.value.access_token;
    }

    async function connect() {
        isConnecting.value = true;
        error.value = null;
        try {
            const data = await apiRequest('zoho', 'getAuthUrl') as { authUrl: string };
            window.location.href = data.authUrl;
        } catch (err: any) {
            error.value = err.message;
            isConnecting.value = false;
        }
    }

    function saveTokens(params: URLSearchParams) {
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');

        if (accessToken && expiresIn) {
            const expiresAt = Date.now() + (parseInt(expiresIn, 10) - 300) * 1000;
            setTokens({
                access_token: accessToken,
                refresh_token: refreshToken || tokens.value?.refresh_token || '',
                expires_at: expiresAt,
            });
            error.value = null;
        } else {
            error.value = params.get('error') || 'Falha na autenticação com o Zoho.';
        }
    }

    async function listEmails() {
        isLoading.value = true;
        error.value = null;
        try {
            const accessToken = await getValidAccessToken();
            if (!accessToken) throw new Error("Não autenticado.");
            
            const data = await apiRequest('zoho', 'listEmails', 'GET', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }) as { emails: ZohoEmailListItem[], accountId: string, primaryEmail: string };
            
            if (!accountInfo.value && data.accountId) {
                setAccountInfo({ accountId: data.accountId, primaryEmailAddress: data.primaryEmail })
            }
            emails.value = data.emails;
        } catch (err: any) {
            error.value = err.message || 'Ocorreu um erro ao buscar os e-mails.';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function getEmailDetails(messageId: string): Promise<ZohoEmail | null> {
        const accessToken = await getValidAccessToken();
        if (!accessToken || !accountInfo.value) throw new Error("Não autenticado ou conta não encontrada.");

        const response = await fetch(`/api/router?entity=zoho&action=getEmail&messageId=${messageId}&accountId=${accountInfo.value.accountId}`, {
             headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return await handleApiResponse<ZohoEmail>(response);
    }
    
    async function sendEmail(to: string, subject: string, content: string, attachments: File[] = []) {
        const accessToken = await getValidAccessToken();
        if (!accessToken || !accountInfo.value) throw new Error("Não autenticado ou conta não encontrada.");

        const formData = new FormData();
        formData.append('toAddress', to);
        formData.append('subject', subject);
        formData.append('content', content);
        formData.append('accountId', accountInfo.value.accountId);
        formData.append('fromAddress', accountInfo.value.primaryEmailAddress);

        attachments.forEach(file => {
            formData.append('attachments', file, file.name);
        });
        
        const response = await fetch('/api/router?entity=zoho&action=sendEmail', {
             method: 'POST',
             headers: { 'Authorization': `Bearer ${accessToken}` },
             body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao enviar e-mail.');
        }
    }


    return {
        tokens,
        accountInfo,
        isConnecting,
        isLoading,
        error,
        emails,
        isAuthenticated,
        connect,
        disconnect,
        saveTokens,
        listEmails,
        getEmailDetails,
        sendEmail
    };
});
