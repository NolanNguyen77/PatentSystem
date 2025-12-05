// API Configuration
const API_BASE_URL = 'http://localhost:4001/api';

// Toggle between mock and real API
// Set to 'false' in .env to use real backend API
// @ts-ignore - Vite env types
const USE_MOCK_API = (import.meta.env?.VITE_USE_MOCK_API === 'true') || false; // Default to real API

// Mock API (placeholder - not implemented yet)
const mockAPI = {
  auth: {} as any,
  title: {} as any,
  patent: {} as any,
  importExport: {} as any,
  merge: {} as any,
  attachment: {} as any,
  user: {} as any,
  company: {} as any,
};

// Helper function for real API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const token = localStorage.getItem('authToken');
    const isFormData = options?.body instanceof FormData;
    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🔍 API Call:', {
      url: fullUrl,
      method: options?.method || 'GET',
      headers,
    });

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log('📊 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('❌ API Error Response JSON:', errorData);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        if (errorData.details) {
          console.error('❌ Error Details:', errorData.details);
        }
      } catch (e) {
        // If not JSON, try text
        const errorText = await response.text();
        console.error('❌ API Error Response Text:', errorText);
        if (errorText) {
          errorMessage = errorText;
        }
      }
      return { error: errorMessage };
    }

    const data = await response.json();
    console.log('✅ API Response Data:', data);
    return { data };
  } catch (error) {
    console.error('❌ API call failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Real API implementations
const realAuthAPI = {
  login: async (username: string, password: string) => {
    const result = await apiCall<{ token: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (result.data && result.data.token) {
      // Store token in localStorage
      localStorage.setItem('authToken', result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
    }

    return result;
  },

  logout: async () => {
    const result = await apiCall('/auth/logout', { method: 'POST' });
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    return result;
  },
};

const realTitleAPI = {
  getAll: async (filters?: {
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiCall<{
      titles: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/titles?${params.toString()}`);
  },

  getById: async (id: string) => {
    return apiCall<any>(`/titles/${id}`);
  },

  create: async (titleData: {
    titleName: string;
    dataType?: string;
    markColor?: string;
    parentTitleId?: string;
    saveDate: string;
    disallowEvaluation?: boolean;
    allowEvaluation?: boolean;
    viewPermission?: string;
    editPermission?: string;
    mainEvaluation?: boolean;
    singlePatentMultipleEvaluations?: boolean;
    users?: Array<{
      userId: string;
      isMainResponsible?: boolean;
      permission?: string;
      evalEmail?: boolean;
      confirmEmail?: boolean;
      displayOrder?: number;
    }>;
  }) => {
    return apiCall<{ id: string; message: string }>('/titles', {
      method: 'POST',
      body: JSON.stringify(titleData),
    });
  },

  update: async (id: string, titleData: any) => {
    return apiCall<{ message: string }>(`/titles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(titleData),
    });
  },

  delete: async (id: string) => {
    return apiCall<{ message: string }>(`/titles/${id}`, {
      method: 'DELETE',
    });
  },

  copy: async (id: string, newTitleName: string, copyPatents: boolean = true) => {
    return apiCall<{ id: string; message: string }>(`/titles/${id}/copy`, {
      method: 'POST',
      body: JSON.stringify({ newTitleName, copyPatents }),
    });
  },

  search: async (query: string) => {
    return apiCall<{ titles: any[] }>(`/titles/search?q=${encodeURIComponent(query)}`);
  },
};

const realMergeAPI = {
  getMergeCandidates: async (titleIds: string[]) => {
    return apiCall<{
      titles: Array<{ id: string; titleName: string; titleNo: string }>;
      evaluations: Array<{ id: string; code: string; titleId: string; titleName: string; itemName: string; evaluationStatus: string }>;
    }>('/titles/merge/candidates', {
      method: 'POST',
      body: JSON.stringify({ titleIds }),
    });
  },

  mergeTitles: async (mergeData: {
    newTitleName: string;
    department: string;
    priorityList: string[];
    selectedEvaluations: string[];
  }) => {
    return apiCall<{
      id: string;
      message: string
    }>('/titles/merge', {
      method: 'POST',
      body: JSON.stringify(mergeData),
    });
  },
};

const realPatentAPI = {
  getByTitle: async (titleId: string, filters?: {
    status?: 'evaluated' | 'unevaluated';
    search?: string;
    includeFullText?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.includeFullText) params.append('includeFullText', 'true');

    return apiCall<{
      patents: any[];
      total: number;
      evaluatedCount: number;
      unevaluatedCount: number;
      progressRate: number;
    }>(`/titles/${titleId}/patents?${params}`);
  },

  // Fetch patents by company name using existing backend route
  // Postman collection shows: GET /api/patents/companies/:name/patents
  getByCompany: async (companyName: string, filters?: { status?: 'evaluated' | 'unevaluated'; search?: string; includeFullText?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.includeFullText) params.append('includeFullText', 'true');

    return apiCall<{
      patents: any[];
      total: number;
      evaluatedCount: number;
      unevaluatedCount: number;
      progressRate: number;
    }>(`/patents/companies/${encodeURIComponent(companyName)}/patents?${params}`);
  },

  updateStatus: async (patentId: string, status: 'evaluated' | 'unevaluated') => {
    return apiCall<{ message: string }>(`/patents/${patentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  create: async (patentData: any) => {
    return apiCall<{ id: string; message: string }>('/patents', {
      method: 'POST',
      body: JSON.stringify(patentData),
    });
  },

  getById: async (patentId: string) => {
    return apiCall<any>(`/patents/${patentId}`);
  },

  update: async (patentId: string, patentData: any) => {
    return apiCall<{ message: string }>(`/patents/${patentId}`, {
      method: 'PUT',
      body: JSON.stringify(patentData),
    });
  },

  deleteBatch: async (ids: string[]) => {
    return apiCall<{ message: string; count: number }>('/patents/delete-batch', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  assign: async (mode: 'add' | 'replace' | 'remove', patentIds: string[], userIds: string[]) => {
    return apiCall<{ message: string; count: number }>('/patents/assign', {
      method: 'POST',
      body: JSON.stringify({ mode, patentIds, userIds }),
    });
  },

  search: async (criteria: {
    mode: 'number' | 'condition';
    searchOption?: 'exact' | 'partial';
    numbers?: string[];
    numberType?: string;
    expression?: string;
    conditions?: Record<string, { field: string; value: string }>;
    titleIds?: string[];
  }) => {
    return apiCall<{ count: number; patents: any[] }>('/patents/search', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },
};

const realImportExportAPI = {
  importCSV: async (file: File, columnMapping: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(columnMapping));

    return apiCall<{
      imported: number;
      failed: number;
      message: string
    }>('/import/csv', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  exportData: async (exportConfig: {
    titleId: string;
    fields: string[];
    format: 'csv' | 'excel';
  }) => {
    return apiCall<{ downloadUrl: string }>('/export/data', {
      method: 'POST',
      body: JSON.stringify(exportConfig),
    });
  },

  getExportFields: async () => {
    return apiCall<{
      allFields: string[];
      defaultFields: string[]
    }>('/export/fields');
  },

  exportSearchResults: async (criteria: any, format: 'csv' | 'excel' = 'csv') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/import/search-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ criteria, format }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || 'Export failed' };
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search_results_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

const realAttachmentAPI = {
  upload: async (titleId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiCall<{
      id: string;
      filename: string;
      url: string
    }>(`/titles/${titleId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  getAll: async (titleId: string) => {
    return apiCall<{ attachments: any[] }>(`/titles/${titleId}/attachments`);
  },

  delete: async (attachmentId: string) => {
    return apiCall<{ message: string }>(`/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  },

  download: async (attachmentId: string, filename: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}/download`, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

const realUserAPI = {
  getAll: async () => {
    return apiCall<{ users: any[] }>('/users');
  },

  getDepartments: async () => {
    return apiCall<{ departments: any[] }>('/departments');
  },

  getUsersByDepartment: async (departmentId: string) => {
    return apiCall<{ users: any[] }>(`/departments/${departmentId}/users`);
  },
};

const realCompanyAPI = {
  getPatents: async (companyName: string, filters?: {
    status?: 'evaluated' | 'unevaluated';
  }) => {
    const params = new URLSearchParams(filters as any);
    return apiCall<{
      patents: any[];
      total: number;
      evaluatedCount: number;
      unevaluatedCount: number;
      progressRate: number;
    }>(`/companies/${encodeURIComponent(companyName)}/patents?${params}`);
  },
};

const realEvaluationAPI = {
  batchSave: async (titleId: string, evaluations: Array<{ patentId: string; status: string; comment?: string }>) => {
    return apiCall<{ message: string; created: number; updated: number; unchanged: number }>('/evaluations/batch', {
      method: 'POST',
      body: JSON.stringify({ titleId, evaluations }),
    });
  },
};

// ==================== Export APIs with Mock/Real Toggle ====================

// Switch between mock and real API based on environment variable
export const authAPI = USE_MOCK_API ? mockAPI.auth : realAuthAPI;
export const titleAPI = USE_MOCK_API ? mockAPI.title : realTitleAPI;
export const patentAPI = USE_MOCK_API ? mockAPI.patent : realPatentAPI;
export const importExportAPI = USE_MOCK_API ? mockAPI.importExport : realImportExportAPI;
export const mergeAPI = USE_MOCK_API ? mockAPI.merge : realMergeAPI;
export const attachmentAPI = USE_MOCK_API ? mockAPI.attachment : realAttachmentAPI;
export const userAPI = USE_MOCK_API ? mockAPI.user : realUserAPI;
export const companyAPI = USE_MOCK_API ? mockAPI.company : realCompanyAPI;
export const evaluationAPI = realEvaluationAPI;

// Export all APIs as default
export default {
  auth: authAPI,
  title: titleAPI,
  patent: patentAPI,
  importExport: importExportAPI,
  merge: mergeAPI,
  attachment: attachmentAPI,
  user: userAPI,
  company: companyAPI,
  evaluation: evaluationAPI,
};

// Log current API mode
if (typeof window !== 'undefined') {
  console.log(`🔧 API Mode: ${USE_MOCK_API ? 'MOCK' : 'REAL'}`);
}
