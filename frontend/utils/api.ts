// API utility functions with JWT authentication

// Configure your backend URL here
// Examples:
// - Development: 'http://localhost:3001/api'
// - Production: 'https://your-backend.com/api'
// - Relative path: '/api' (same domain)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Set to true to always use fallback (for testing without backend)
const USE_FALLBACK_AUTH = import.meta.env.VITE_USE_FALLBACK_AUTH === 'true';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Login API call
export const login = async (username: string, password: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return {
      success: response.ok,
      ...data,
    };
  } catch (error) {
    console.error('Login failed:', error);
    return {
      success: false,
      message: 'ログインに失敗しました',
    };
  }
};

// Fallback login for when backend is not available
const fallbackLogin = (username: string, password: string): ApiResponse => {
  // Check credentials (temporary fallback)
  if (username === 'Nguyen' && password === '1') {
    // Generate a mock JWT token
    const mockToken = btoa(JSON.stringify({
      username,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      iat: Date.now(),
    }));

    return {
      success: true,
      token: `mock.${mockToken}.signature`,
      message: 'ログイン成功 (オフラインモード)',
    };
  }

  return {
    success: false,
    message: 'ユーザー名またはパスワードが正しくありません',
  };
};

// Generic authenticated API call
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    removeAuthToken();
    localStorage.removeItem('username');
    window.location.reload();
  }

  return response;
};

// Get titles data
export const getTitles = async (): Promise<ApiResponse> => {
  try {
    const response = await authenticatedFetch('/titles', {
      method: 'GET',
    });

    const data = await response.json();
    return {
      success: response.ok,
      ...data,
    };
  } catch (error) {
    console.error('Get titles API error:', error);
    return {
      success: false,
      message: 'データの取得に失敗しました。',
    };
  }
};

// Delete title
export const deleteTitle = async (titleId: string): Promise<ApiResponse> => {
  try {
    const response = await authenticatedFetch(`/titles/${titleId}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return {
      success: response.ok,
      ...data,
    };
  } catch (error) {
    console.error('Delete title API error:', error);
    return {
      success: false,
      message: 'タイトルの削除に失敗しました。',
    };
  }
};
