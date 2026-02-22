const API_BASE_URL = 'http://127.0.0.1:8000';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};

const parseError = (detail: any): string => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail.map(d => d.msg || JSON.stringify(d)).join(', ');
    }
    if (typeof detail === 'object' && detail !== null) {
        return detail.msg || detail.message || JSON.stringify(detail);
    }
    return 'An unexpected error occurred';
};

export const api = {
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) return { error: parseError(data.detail || 'API Error') };
            return { data };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) return { error: parseError(data.detail || 'API Error') };
            return { data };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        try {
            const headers: Record<string, string> = {};
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) return { error: parseError(data.detail || 'API Error') };
            return { data };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    async login(form_data: FormData): Promise<ApiResponse<{ access_token: string; token_type: string }>> {
        try {
            const response = await fetch(`${API_BASE_URL}/token`, {
                method: 'POST',
                body: form_data, // Using FormData for OAuth2PasswordRequestForm
            });
            const data = await response.json();
            if (!response.ok) return { error: parseError(data.detail || 'Login failed') };
            return { data };
        } catch (error: any) {
            return { error: error.message };
        }
    }
};
